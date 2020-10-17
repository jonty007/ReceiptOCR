const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const SKIPWORDS = ['eur', 'stk', 'x'],
    STOPWORDS = ['summe', 'visa', 'mwst', 'brutto', 'netto', 'zahlen', 'kreditkarte', 'ust-id-nr', 'rück geld'],
    MARKETS = ['drogerie', 'lidl', 'rewe', 'real', 'allguth', 'dm'],
    BLACKLIST_WORDS = ['steuer-nr', 'eur*', 'pfand'],
    allowed_labels = ['article', 'price', 'market', 'address', 'date', 'misc'],
    min_length = 5, max_height = 1;


class TextBlock {
    constructor(vertex, label) {
        this.vertices = vertex.boundingPoly.vertices;
        this.description = vertex.description;
        this.label = label;
    }
}

function is_number(val) {
    val = val.trim();
    let num = parseFloat(val);

    if ((num + "").length !== val.length) {
        console.log(`${val} is not float`);
        return false;
    }

    if (num || num === 0) {
        console.log(`${val} is float`);
        true;   
    }

    console.log(`${val} is not float`);
    return false;
}

function is_decimal(val) {
    if (!is_number(val)) {
        console.log(`${val} is not decimal`);
        return false;
    }

    if (Math.round(parseFloat(val)) !== parseFloat(val)) {
        console.log(`${val} is decimal`);
        return true;
    }

    console.log(`${val} is not decimal`);
    return false;
}

function is_integer(val) {
    if (!is_number(val)) {
        console.log(`${val} is not integer`);
        return false;
    }

    if (Math.round(parseFloat(val)) === parseFloat(val)) {
        console.log(`${val} is integer`);
        return true;
    }

    console.log(`${val} is not integer`);
    return false;
}

function blacklist(val) {
    if (val.length < 5) {
        console.log(`${val} is not blacklist`);
        return false;
    }
    for(let i = 0; i < BLACKLIST_WORDS.length; i++) {
        if (val.includes(BLACKLIST_WORDS[i])) {
            console.log(`${val} is not decimal`);
            return false;
        }
    }

    console.log(`${val} is blacklist`);
    return true;
}

function findMinX(verticles) {
    let val = verticles[0].x;
    for (let i = 1; i <  verticles.length; i++) {
        if (verticles[i].x < val) {
            val = verticles[i].x;
        } 
    }
    return val;
}

function findMinY(verticles) {
    let val = verticles[0].y;
    for (let i = 1; i <  verticles.length; i++) {
        if (verticles[i].y < val) {
            val = verticles[i].y;
        } 
    }
    return val;
}

function findMaxX(verticles) {
    let val = verticles[0].x;
    for (let i = 1; i <  verticles.length; i++) {
        if (verticles[i].x > val) {
            val = verticles[i].x;
        } 
    }
    return val;
}

function findMaxY(verticles) {
    let val = verticles[0].y;
    for (let i = 1; i <  verticles.length; i++) {
        if (verticles[i].y > val) {
            val = verticles[i].y;
        } 
    }
    return val;
}

function parse_date(date_str) {
    let split_str = date_str.split(' ');
    console.log(`parsing date: ${date_str}`)
    for (let i = 0; i < split_str.length; i++) {
        let date = new Date(split_str[i]);
        if (date) {
            console.log(`found date ${date} for sub_str ${split_str[i]}`);
            return date;
        }
    }
    console.log('null returned');
    return null;
}

function check_price(field_val) {
    console.log(`checking field val ${field_val}`);
    let pr = null;
    if (field_val.includes(' ')) {
        pr = field_val.split(' ')[0];
    } else {
        pr = field_val;
    }
    console.log(`checking pr ${pr}`);
    pr = pr.replace('B', '').replace('A', '');
    pr = pr.replace(',', '.');
    console.log(`checking final pr ${pr}`);
    if(is_decimal(pr)) {
        console.log(`checking final pr ${pr} is price`);
        return pr;
    }
    return false;
}

function check_annotation_type(text_body) {

    if (text_body[-1] == ',') {
        console.log(`${text_body} is handing`);
        return 'hanging';
    }
    if (check_price(text_body) || check_price(text_body) === 0) {
        console.log(`${text_body} is number`);
        return 'number';
    }
    if (parse_date(text_body)) {
        console.log(`${text_body} is date`);
        return 'date';
    }
    if (is_integer(text_body)) {
        console.log(`${text_body} is int`);
        return 'int';
    }
    if(check_market(text_body)){
        console.log(`${text_body} is market`);
        return 'market';
    }
    console.log(`${text_body} is text`);
    return 'text';
}

function parseResponse(gcloudResponse) {
    let articles = [];
    let dates = [];
    let markets = [];
    let seen_indexes = [];
    let seen_prices = [];
    let parsed_y = 0;
    let base_ann = gcloudResponse.textAnnotations[0];
    let g_xmin = findMinX(base_ann.boundingPoly.vertices);
    let g_xmax = findMaxX(base_ann.boundingPoly.vertices);
    let g_ymin = findMinY(base_ann.boundingPoly.vertices);
    let g_ymax = findMaxY(base_ann.boundingPoly.vertices);
    console.log('bounding points: ', g_xmin, g_xmax, g_ymin, g_ymax);
    let break_this = false;
    let sorted_annotatations = gcloudResponse.textAnnotations.slice(1);
    console.log('gcloud length:  ', gcloudResponse.length);
    console.log('sorted length:  ', sorted_annotatations.length);


    return gcloudResponse;
}

export async function parse_receipt() {
    try {
        let gcloudResponse = await client.textDetection("/home/quanteon/Downloads/test1.png");
        let parsedResponse = parseResponse(gcloudResponse[0]);
        return parsedResponse
    } catch (error) {
        throw error;
    }
}