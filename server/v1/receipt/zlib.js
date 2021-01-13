/* Copyright (C) 1999,2012 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0.1
 * LastModified: Jun 29 2012
 */

/* Interface:
 * data = zip_inflate(src);
 */

/* constant parameters */
let zip_WSIZE = 32768;		// Sliding Window size
let zip_STORED_BLOCK = 0;

/* for inflate */
let zip_lbits = 9; 		// bits in base literal/length lookup table
let zip_dbits = 6; 		// bits in base distance lookup table



/* constant tables (inflate) */
let zip_MASK_BITS = new Array(
    0x0000,
    0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
    0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff);
// Tables for deflate from PKZIP's appnote.txt.
let zip_cplens = new Array( // Copy lengths for literal codes 257..285
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
    35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0);
/* note: see note #13 above about the 258 in this list. */
let zip_cplext = new Array( // Extra bits for literal codes 257..285
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
    3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99); // 99==invalid
let zip_cpdist = new Array( // Copy offsets for distance codes 0..29
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
    8193, 12289, 16385, 24577);
let zip_cpdext = new Array( // Extra bits for distance codes
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
    12, 12, 13, 13);
let zip_border = new Array(  // Order of the bit length code lengths
    16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15);
/* objects (inflate) */

function zip_HuftList() {
    this.next = null;
    this.list = null;
}

function zip_HuftNode() {
    this.e = 0; // number of extra bits or operation
    this.b = 0; // number of bits in this code or subcode

    // union
    this.n = 0; // literal, length base, or distance base
    this.t = null; // (zip_HuftNode) pointer to next level of table
}

function zip_HuftBuild(b,	// code lengths in bits (all assumed <= BMAX)
		       n,	// number of codes (assumed <= N_MAX)
		       s,	// number of simple-valued codes (0..s-1)
		       d,	// list of base values for non-simple codes
		       e,	// list of extra bits for non-simple codes
		       mm	// maximum lookup bits
		   ) {
    this.BMAX = 16;   // maximum bit length of any code
    this.N_MAX = 288; // maximum number of codes in any set
    this.status = 0;	// 0: success, 1: incomplete table, 2: bad input
    this.root = null;	// (zip_HuftList) starting table
    this.m = 0;		// maximum lookup bits, returns actual

    /* Given a list of code lengths and a maximum table size, make a set of
       tables to decode that set of codes.	Return zero on success, one if
       the given code set is incomplete (the tables are still built in this
       case), two if the input is invalid (all zero length codes or an
       oversubscribed set of lengths), and three if not enough memory.
       The code with value 256 is special, and the tables are constructed
       so that no bits beyond that code are fetched when that code is
       decoded. */
    {
        let a;			// counter for codes of length k
        let c = new Array(this.BMAX + 1);	// bit length count table
        let el;			// length of EOB code (value 256)
        let f;			// i repeats in table every f entries
        let g;			// maximum code length
        let h;			// table level
        let i;			// counter, current code
        let j;			// counter
        let k;			// number of bits in current code
        let lx = new Array(this.BMAX + 1);	// stack of bits per table
        let p;			// pointer into c[], b[], or v[]
        let pidx;		// index of p
        let q;			// (zip_HuftNode) points to current table
        let r = new zip_HuftNode(); // table entry for structure assignment
        let u = new Array(this.BMAX); // zip_HuftNode[BMAX][]  table stack
        let v = new Array(this.N_MAX); // values in order of bit length
        let w;
        let x = new Array(this.BMAX + 1);// bit offsets, then code stack
        let xp;			// pointer into x or c
        let y;			// number of dummy codes added
        let z;			// number of entries in current table
        let o;
        let tail;		// (zip_HuftList)

        tail = this.root = null;
        for (i = 0; i < c.length; i++)
            c[i] = 0;
        for (i = 0; i < lx.length; i++)
            lx[i] = 0;
        for (i = 0; i < u.length; i++)
            u[i] = null;
        for (i = 0; i < v.length; i++)
            v[i] = 0;
        for (i = 0; i < x.length; i++)
            x[i] = 0;

        // Generate counts for each bit length
        el = n > 256 ? b[256] : this.BMAX; // set length of EOB code, if any
        p = b; pidx = 0;
        i = n;
        do {
            c[p[pidx]]++;	// assume all entries <= BMAX
            pidx++;
        } while (--i > 0);
        if (c[0] == n) {	// null input--all zero length codes
            this.root = null;
            this.m = 0;
            this.status = 0;
            return;
        }

        // Find minimum and maximum length, bound *m by those
        for (j = 1; j <= this.BMAX; j++)
            if (c[j] != 0)
                break;
        k = j;			// minimum code length
        if (mm < j)
            mm = j;
        for (i = this.BMAX; i != 0; i--)
            if (c[i] != 0)
                break;
        g = i;			// maximum code length
        if (mm > i)
            mm = i;

        // Adjust last length count to fill out codes, if needed
        for (y = 1 << j; j < i; j++, y <<= 1)
            if ((y -= c[j]) < 0) {
                this.status = 2;	// bad input: more codes than bits
                this.m = mm;
                return;
            }
        if ((y -= c[i]) < 0) {
            this.status = 2;
            this.m = mm;
            return;
        }
        c[i] += y;

        // Generate starting offsets into the value table for each length
        x[1] = j = 0;
        p = c;
        pidx = 1;
        xp = 2;
        while (--i > 0)		// note that i == g from above
            x[xp++] = (j += p[pidx++]);

        // Make a table of values in order of bit lengths
        p = b; pidx = 0;
        i = 0;
        do {
            if ((j = p[pidx++]) != 0)
                v[x[j]++] = i;
        } while (++i < n);
        n = x[g];			// set n to length of v

        // Generate the Huffman codes and for each, make the table entries
        x[0] = i = 0;		// first Huffman code is zero
        p = v; pidx = 0;		// grab values in bit order
        h = -1;			// no tables yet--level -1
        w = lx[0] = 0;		// no bits decoded yet
        q = null;			// ditto
        z = 0;			// ditto

        // go through the bit lengths (k already is bits in shortest code)
        for (; k <= g; k++) {
            a = c[k];
            while (a-- > 0) {
                // here i is the Huffman code of length k bits for value p[pidx]
                // make tables up to required level
                while (k > w + lx[1 + h]) {
                    w += lx[1 + h]; // add bits already decoded
                    h++;

                    // compute minimum size table less than or equal to *m bits
                    z = (z = g - w) > mm ? mm : z; // upper limit
                    if ((f = 1 << (j = k - w)) > a + 1) { // try a k-w bit table
                        // too few codes for k-w bit table
                        f -= a + 1;	// deduct codes from patterns left
                        xp = k;
                        while (++j < z) { // try smaller tables up to z bits
                            if ((f <<= 1) <= c[++xp])
                                break;	// enough codes to use up j bits
                            f -= c[xp];	// else deduct codes from patterns
                        }
                    }
                    if (w + j > el && w < el)
                        j = el - w;	// make EOB code end at table
                    z = 1 << j;	// table entries for j-bit table
                    lx[1 + h] = j; // set table size in stack

                    // allocate and link in new table
                    q = new Array(z);
                    for (o = 0; o < z; o++) {
                        q[o] = new zip_HuftNode();
                    }

                    if (tail == null)
                        tail = this.root = new zip_HuftList();
                    else
                        tail = tail.next = new zip_HuftList();
                    tail.next = null;
                    tail.list = q;
                    u[h] = q;	// table starts after link

                    /* connect to last table, if there is one */
                    if (h > 0) {
                        x[h] = i;		// save pattern for backing up
                        r.b = lx[h];	// bits to dump before this table
                        r.e = 16 + j;	// bits in this table
                        r.t = q;		// pointer to this table
                        j = (i & ((1 << w) - 1)) >> (w - lx[h]);
                        u[h - 1][j].e = r.e;
                        u[h - 1][j].b = r.b;
                        u[h - 1][j].n = r.n;
                        u[h - 1][j].t = r.t;
                    }
                }

                // set up table entry in r
                r.b = k - w;
                if (pidx >= n)
                    r.e = 99;		// out of values--invalid code
                else if (p[pidx] < s) {
                    r.e = (p[pidx] < 256 ? 16 : 15); // 256 is end-of-block code
                    r.n = p[pidx++];	// simple code is just the value
                } else {
                    r.e = e[p[pidx] - s];	// non-simple--look up in lists
                    r.n = d[p[pidx++] - s];
                }

                // fill code-like entries with r //
                f = 1 << (k - w);
                for (j = i >> w; j < z; j += f) {
                    q[j].e = r.e;
                    q[j].b = r.b;
                    q[j].n = r.n;
                    q[j].t = r.t;
                }

                // backwards increment the k-bit code i
                for (j = 1 << (k - 1) ; (i & j) != 0; j >>= 1)
                    i ^= j;
                i ^= j;

                // backup over finished tables
                while ((i & ((1 << w) - 1)) != x[h]) {
                    w -= lx[h];		// don't need to update q
                    h--;
                }
            }
        }

        /* return actual size of base table */
        this.m = lx[1];

        /* Return true (1) if we were given an incomplete table */
        this.status = ((y != 0 && g != 1) ? 1 : 0);
    } /* end of constructor */
}



function zip_GET_BYTE(zip_obj) {
    if (zip_obj.zip_inflate_pos == zip_obj.zip_inflate_data_length) return -1;
    let i = zip_obj.zip_inflate_pos >> 2;
    let j = zip_obj.zip_inflate_pos % 4;
    zip_obj.zip_inflate_pos++;
    return (zip_obj.zip_inflate_data[i] >> (3 - j) * 8 & 0xff);
};

function zip_NEEDBITS(n, zip_obj) {
    while (zip_obj.zip_bit_len < n) {
        zip_obj.zip_bit_buf |= zip_GET_BYTE(zip_obj) << zip_obj.zip_bit_len;
        zip_obj.zip_bit_len += 8;
    }
}

function zip_GETBITS(n, zip_obj) {
    return zip_obj.zip_bit_buf & zip_MASK_BITS[n];
}

function zip_DUMPBITS(n, zip_obj) {
    zip_obj.zip_bit_buf >>= n;
    zip_obj.zip_bit_len -= n;
}

function zip_inflate_codes(buff, off, size, zip_obj) {
    /* inflate (decompress) the codes in a deflated (compressed) block.
       Return an error code or zero if it all goes ok. */
    let e;		// table entry flag/number of extra bits
    let t;		// (zip_HuftNode) pointer to table entry
    let n;

    if (size == 0)
        return 0;

    // inflate the coded data
    n = 0;
    for (; ;) {			// do until end of block
        zip_NEEDBITS(zip_obj.zip_bl, zip_obj);
        t = zip_obj.zip_tl.list[zip_GETBITS(zip_obj.zip_bl, zip_obj)];
        e = t.e;
        while (e > 16) {
            if (e == 99)
                return -1;
            zip_DUMPBITS(t.b, zip_obj);
            e -= 16;
            zip_NEEDBITS(e, zip_obj);
            t = t.t[zip_GETBITS(e, zip_obj)];
            e = t.e;
        }
        zip_DUMPBITS(t.b, zip_obj);

        if (e == 16) {		// then it's a literal
            zip_obj.zip_wp &= zip_WSIZE - 1;
            buff[off + n++] = zip_obj.zip_slide[zip_obj.zip_wp++] = t.n;
            if (n == size)
                return size;
            continue;
        }

        // exit if end of block
        if (e == 15)
            break;

        // it's an EOB or a length

        // get length of block to copy
        zip_NEEDBITS(e, zip_obj);
        zip_obj.zip_copy_leng = t.n + zip_GETBITS(e, zip_obj);
        zip_DUMPBITS(e, zip_obj);

        // decode distance of block to copy
        zip_NEEDBITS(zip_obj.zip_bd, zip_obj);
        t = zip_obj.zip_td.list[zip_GETBITS(zip_obj.zip_bd, zip_obj)];
        e = t.e;

        while (e > 16) {
            if (e == 99)
                return -1;
            zip_DUMPBITS(t.b, zip_obj);
            e -= 16;
            zip_NEEDBITS(e, zip_obj);
            t = t.t[zip_GETBITS(e, zip_obj)];
            e = t.e;
        }
        zip_DUMPBITS(t.b, zip_obj);
        zip_NEEDBITS(e, zip_obj);
        zip_obj.zip_copy_dist = zip_obj.zip_wp - t.n - zip_GETBITS(e, zip_obj);
        zip_DUMPBITS(e, zip_obj);

        // do the copy
        while (zip_obj.zip_copy_leng > 0 && n < size) {
            zip_obj.zip_copy_leng--;
            zip_obj.zip_copy_dist &= zip_WSIZE - 1;
            zip_obj.zip_wp &= zip_WSIZE - 1;
            buff[off + n++] = zip_obj.zip_slide[zip_obj.zip_wp++]
            = zip_obj.zip_slide[zip_obj.zip_copy_dist++];
        }

        if (n == size)
            return size;
    }

    zip_obj.zip_method = -1; // done
    return n;
}

function zip_inflate_stored(buff, off, size, zip_obj) {
    /* "decompress" an inflated type 0 (stored) block. */
    let n;

    // go to byte boundary
    n = zip_obj.zip_bit_len & 7;
    zip_DUMPBITS(n, zip_obj);

    // get the length and its complement
    zip_NEEDBITS(16, zip_obj);
    n = zip_GETBITS(16, zip_obj);
    zip_DUMPBITS(16, zip_obj);
    zip_NEEDBITS(16, zip_obj);
    if (n != ((~zip_obj.zip_bit_buf) & 0xffff))
        return -1;			// error in compressed data
    zip_DUMPBITS(16, zip_obj);

    // read and output the compressed data
    zip_obj.zip_copy_leng = n;

    n = 0;
    while (zip_obj.zip_copy_leng > 0 && n < size) {
        zip_obj.zip_copy_leng--;
        zip_obj.zip_wp &= zip_WSIZE - 1;
        zip_NEEDBITS(8, zip_obj);
        buff[off + n++] = zip_obj.zip_slide[zip_obj.zip_wp++] =
            zip_GETBITS(8, zip_obj);
        zip_DUMPBITS(8, zip_obj);
    }

    if (zip_obj.zip_copy_leng == 0)
        zip_obj.zip_method = -1; // done
    return n;
}

function zip_inflate_fixed(buff, off, size, zip_obj) {
    /* decompress an inflated type 1 (fixed Huffman codes) block.  We should
       either replace this with a custom decoder, or at least precompute the
       Huffman tables. */

    // if first time, set up tables for fixed blocks
    if (zip_obj.zip_fixed_tl == null) {
        let i;			// temporary variable
        let l = new Array(288);	// length list for huft_build
        let h;	// zip_HuftBuild

        // literal table
        for (i = 0; i < 144; i++)
            l[i] = 8;
        for (; i < 256; i++)
            l[i] = 9;
        for (; i < 280; i++)
            l[i] = 7;
        for (; i < 288; i++)	// make a complete, but wrong code set
            l[i] = 8;
        zip_obj.zip_fixed_bl = 7;

        h = new zip_HuftBuild(l, 288, 257, zip_cplens, zip_cplext,
                      zip_obj.zip_fixed_bl);
        if (h.status != 0) {
            return -1;
        }
        zip_obj.zip_fixed_tl = h.root;
        zip_obj.zip_fixed_bl = h.m;

        // distance table
        for (i = 0; i < 30; i++)	// make an incomplete code set
            l[i] = 5;
        zip_fixed_bd = 5;

        h = new zip_HuftBuild(l, 30, 0, zip_cpdist, zip_cpdext, zip_fixed_bd);
        if (h.status > 1) {
            zip_obj.zip_fixed_tl = null;
            return -1;
        }
        zip_obj.zip_fixed_td = h.root;
        zip_fixed_bd = h.m;
    }

    zip_obj.zip_tl = zip_obj.zip_fixed_tl;
    zip_obj.zip_td = zip_obj.zip_fixed_td;
    zip_obj.zip_bl = zip_obj.zip_fixed_bl;
    zip_obj.zip_bd = zip_fixed_bd;
    return zip_inflate_codes(buff, off, size, zip_obj);
}

function zip_inflate_dynamic(buff, off, size, zip_obj) {
    // decompress an inflated type 2 (dynamic Huffman codes) block.
    let i;		// temporary variables
    let j;
    let l;		// last length
    let n;		// number of lengths to get
    let t;		// (zip_HuftNode) literal/length code table
    let nb;		// number of bit length codes
    let nl;		// number of literal/length codes
    let nd;		// number of distance codes
    let ll = new Array(286 + 30); // literal/length and distance code lengths
    let h;		// (zip_HuftBuild)

    for (i = 0; i < ll.length; i++)
        ll[i] = 0;

    // read in table lengths
    zip_NEEDBITS(5, zip_obj);
    nl = 257 + zip_GETBITS(5, zip_obj);	// number of literal/length codes
    zip_DUMPBITS(5, zip_obj);
    zip_NEEDBITS(5, zip_obj);
    nd = 1 + zip_GETBITS(5, zip_obj);	// number of distance codes
    zip_DUMPBITS(5, zip_obj);
    zip_NEEDBITS(4, zip_obj);
    nb = 4 + zip_GETBITS(4, zip_obj);	// number of bit length codes
    zip_DUMPBITS(4, zip_obj);
    if (nl > 286 || nd > 30)
        return -1;		// bad lengths

    // read in bit-length-code lengths
    for (j = 0; j < nb; j++) {
        zip_NEEDBITS(3, zip_obj);
        ll[zip_border[j]] = zip_GETBITS(3, zip_obj);
        zip_DUMPBITS(3, zip_obj);
    }
    for (; j < 19; j++)
        ll[zip_border[j]] = 0;

    // build decoding table for trees--single level, 7 bit lookup
    zip_obj.zip_bl = 7;
    h = new zip_HuftBuild(ll, 19, 19, null, null, zip_obj.zip_bl);
    if (h.status != 0)
        return -1;	// incomplete code set

    zip_obj.zip_tl = h.root;
    zip_obj.zip_bl = h.m;

    // read in literal and distance code lengths
    n = nl + nd;
    i = l = 0;
    while (i < n) {
        zip_NEEDBITS(zip_obj.zip_bl, zip_obj);
        t = zip_obj.zip_tl.list[zip_GETBITS(zip_obj.zip_bl,  zip_obj)];
        j = t.b;
        zip_DUMPBITS(j, zip_obj);
        j = t.n;
        if (j < 16)		// length of code in bits (0..15)
            ll[i++] = l = j;	// save last length in l
        else if (j == 16) {	// repeat last length 3 to 6 times
            zip_NEEDBITS(2, zip_obj);
            j = 3 + zip_GETBITS(2, zip_obj);
            zip_DUMPBITS(2, zip_obj);
            if (i + j > n)
                return -1;
            while (j-- > 0)
                ll[i++] = l;
        } else if (j == 17) {	// 3 to 10 zero length codes
            zip_NEEDBITS(3, zip_obj);
            j = 3 + zip_GETBITS(3, zip_obj);
            zip_DUMPBITS(3, zip_obj);
            if (i + j > n)
                return -1;
            while (j-- > 0)
                ll[i++] = 0;
            l = 0;
        } else {		// j == 18: 11 to 138 zero length codes
            zip_NEEDBITS(7, zip_obj);
            j = 11 + zip_GETBITS(7, zip_obj);
            zip_DUMPBITS(7, zip_obj);
            if (i + j > n)
                return -1;
            while (j-- > 0)
                ll[i++] = 0;
            l = 0;
        }
    }

    // build the decoding tables for literal/length and distance codes
    zip_obj.zip_bl = zip_lbits;
    h = new zip_HuftBuild(ll, nl, 257, zip_cplens, zip_cplext, zip_obj.zip_bl);
    if (zip_obj.zip_bl == 0)	// no literals or lengths
        h.status = 1;
    if (h.status != 0) {
        if (h.status == 1)
            ;// **incomplete literal tree**
        return -1;		// incomplete code set
    }
    zip_obj.zip_tl = h.root;
    zip_obj.zip_bl = h.m;

    for (i = 0; i < nd; i++)
        ll[i] = ll[i + nl];
    zip_obj.zip_bd = zip_dbits;
    h = new zip_HuftBuild(ll, nd, 0, zip_cpdist, zip_cpdext, zip_obj.zip_bd);
    zip_obj.zip_td = h.root;
    zip_obj.zip_bd = h.m;

    if (zip_obj.zip_bd == 0 && nl > 257) {   // lengths but no distances
        // **incomplete distance tree**
        return -1;
    }

    if (h.status == 1) {
        ;// **incomplete distance tree**
    }
    if (h.status != 0)
        return -1;

    // decompress until an end-of-block code
    return zip_inflate_codes(buff, off, size, zip_obj);
}

function zip_inflate_internal(buff, off, size, zip_obj) {
    // decompress an inflated entry
    let n, i;

    n = 0;
    while (n < size) {
        if (zip_obj.zip_eof && zip_obj.zip_method == -1)
            return n;

        if (zip_obj.zip_copy_leng > 0) {
            if (zip_obj.zip_method != zip_STORED_BLOCK) {
                // STATIC_TREES or DYN_TREES
                while (zip_obj.zip_copy_leng > 0 && n < size) {
                    zip_obj.zip_copy_leng--;
                    zip_obj.zip_copy_dist &= zip_WSIZE - 1;
                    zip_obj.zip_wp &= zip_WSIZE - 1;
                    buff[off + n++] = zip_obj.zip_slide[zip_obj.zip_wp++] =
                    zip_obj.zip_slide[zip_obj.zip_copy_dist++];
                }
            } else {
                while (zip_obj.zip_copy_leng > 0 && n < size) {
                    zip_obj.zip_copy_leng--;
                    zip_obj.zip_wp &= zip_WSIZE - 1;
                    zip_NEEDBITS(8, zip_obj);
                    buff[off + n++] = zip_obj.zip_slide[zip_obj.zip_wp++] = zip_GETBITS(8, zip_obj);
                    zip_DUMPBITS(8, zip_obj);
                }
                if (zip_obj.zip_copy_leng == 0)
                    zip_obj.zip_method = -1; // done
            }
            if (n == size)
                return n;
        }

        if (zip_obj.zip_method == -1) {
            if (zip_obj.zip_eof)
                break;

            // read in last block bit
            zip_NEEDBITS(1, zip_obj);
            if (zip_GETBITS(1, zip_obj) != 0)
                zip_obj.zip_eof = true;
            zip_DUMPBITS(1, zip_obj);

            // read in block type
            zip_NEEDBITS(2, zip_obj);
            zip_obj.zip_method = zip_GETBITS(2, zip_obj);
            zip_DUMPBITS(2, zip_obj);
            zip_obj.zip_tl = null;
            zip_obj.zip_copy_leng = 0;
        }

        switch (zip_obj.zip_method) {
            case 0: // zip_STORED_BLOCK
                i = zip_inflate_stored(buff, off + n, size - n, zip_obj);
                break;

            case 1: // zip_STATIC_TREES
                if (zip_obj.zip_tl != null)
                    i = zip_inflate_codes(buff, off + n, size - n, zip_obj);
                else
                    i = zip_inflate_fixed(buff, off + n, size - n, zip_obj);
                break;

            case 2: // zip_DYN_TREES
                if (zip_obj.zip_tl != null)
                    i = zip_inflate_codes(buff, off + n, size - n, zip_obj);
                else
                    i = zip_inflate_dynamic(buff, off + n, size - n, zip_obj);
                break;

            default: // error
                i = -1;
                break;
        }

        if (i == -1) {
            if (zip_obj.zip_eof)
                return 0;
            return -1;
        }
        n += i;
    }
    return n;
}

export function zip_inflate(str, length) {
    let out, buff;
    let i, j;

    /* variables (inflate) */

    let zip_obj = {
        zip_slide: new Array(2 * zip_WSIZE),
        zip_wp: 0,
        zip_fixed_tl:  null,
        zip_fixed_td: null,
        zip_fixed_bl: null,
        zip_bit_buf: 0,
        zip_bit_len: 0,
        zip_method: -1,
        zip_eof: false,
        zip_copy_leng: 0 ,
        zip_copy_dist: 0,
        zip_tl: null,
        zip_td: null,
        zip_bl: null,
        zip_bd: null,
        zip_inflate_pos: 0,
        last_zip_inflate_pos: -1,
        zip_inflate_data:  str,
        zip_inflate_data_length: length
    };

    buff = new Array(1024);
    out = "";
    while ((i = zip_inflate_internal(buff, 0, buff.length, zip_obj)) > 0 &&
	  zip_obj.last_zip_inflate_pos != zip_obj.zip_inflate_pos) {
        zip_obj.last_zip_inflate_pos = zip_obj.zip_inflate_pos;
        for (j = 0; j < i; j++)
            out += String.fromCharCode(buff[j]);
    }
    return out;
}
