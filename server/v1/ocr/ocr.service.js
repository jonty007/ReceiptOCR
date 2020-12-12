const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const SKIPWORDS = ['eur', 'stk', 'x'],
  STOPWORDS = [
    'summe',
    'visa',
    'mwst',
    'brutto',
    'netto',
    'zahlen',
    'kreditkarte',
    'ust-id-nr',
    'rück geld'
  ],
  MARKETS = ['drogerie', 'lidl', 'rewe', 'real', 'allguth', 'dm'],
  BLACKLIST_WORDS = ['steuer-nr', 'eur*', 'pfand'],
  allowed_labels = ['article', 'price', 'market', 'address', 'date', 'misc'],
  min_length = 5,
  max_height = 1;

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

  if ((num + '').length !== val.length) {
    console.log(`${val} is not float`);
    return false;
  }

  if (num || num === 0) {
    console.log(`${val} is float`);
    return true;
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
  for (let i = 0; i < BLACKLIST_WORDS.length; i++) {
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
  for (let i = 1; i < verticles.length; i++) {
    if (verticles[i].x < val) {
      val = verticles[i].x;
    }
  }
  return val;
}

function findMinY(verticles) {
  let val = verticles[0].y;
  for (let i = 1; i < verticles.length; i++) {
    if (verticles[i].y < val) {
      val = verticles[i].y;
    }
  }
  return val;
}

function findMaxX(verticles) {
  let val = verticles[0].x;
  for (let i = 1; i < verticles.length; i++) {
    if (verticles[i].x > val) {
      val = verticles[i].x;
    }
  }
  return val;
}

function findMaxY(verticles) {
  let val = verticles[0].y;
  for (let i = 1; i < verticles.length; i++) {
    if (verticles[i].y > val) {
      val = verticles[i].y;
    }
  }
  return val;
}

function parse_date(date_str) {
  let split_str = date_str.split(' ');
  console.log(`parsing date: ${date_str}`);
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
  if (is_decimal(pr)) {
    console.log(`checking final pr ${pr} is price`);
    return pr;
  }
  return false;
}

function check_market(text_body) {
  for (let i = 0; i < MARKETS.length; i++) {
    let market = MARKETS[i];
    if (
      text_body
        .toLowerCase()
        .split(' ')
        .includes(market)
    ) {
      return market;
    }

    if (text_body[0] === 'L' && text_body.substring(2, 5) === 'DL' && text_body.length < 7) {
      return 'lidl';
    }
    if (text_body.substring(0, 4) === 'LID' && text_body.length < 7) {
      return 'lidl';
    }
    if (text_body.substring(0, 4) === 'LDL' && text_body.length < 6) {
      return 'lidl';
    }

    if (text_body.substring(0, 5) === 'LinL') {
      return 'lidl';
    }

    return null;
  }
}

function check_article_name(article_name) {
  let alnum = 0;
  for (let i = 0; i < article_name.length; i++) {
    let chr = article_name[i];
    if (chr.match(/^[a-z]+$/i)) {
      alnum++;
    }
  }
  if (alnum <= 2) {
    return false;
  }

  return true;
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
  if (check_market(text_body)) {
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
  let sorted_annotations = gcloudResponse.textAnnotations.slice(1);
  console.log('gcloud length:  ', gcloudResponse.length);
  console.log('sorted length:  ', sorted_annotations.length);
  let current_name = '';
  for (let i = 0; i < sorted_annotations.length; i++) {
    let annotation = sorted_annotations[i];
    let skip_this = false;

    for (let j = 0; j < STOPWORDS; j++) {
      let word = STOPWORDS[j];
      if (
        annotation.description
          .toLowerCase()
          .split(' ')
          .includes(word)
      ) {
        console.log(`stop word ${annotation.description}`);
        break_this = true;
      }
    }

    for (let j = 0; j < SKIPWORDS; j++) {
      let word = SKIPWORDS[j];
      if (
        annotation.description
          .toLowerCase()
          .split(' ')
          .includes(word)
      ) {
        console.log(`skip word ${annotation.description}`);
        current_name = '';
        skip_this = true;
      }
    }

    for (let j = 0; j < BLACKLIST_WORDS; j++) {
      let word = BLACKLIST_WORDS[j];
      if (
        annotation.description
          .toLowerCase()
          .split(' ')
          .includes(word)
      ) {
        console.log(`skip word ${annotation.description}`);
        current_name = '';
        skip_this = true;
      }
    }

    if (skip_this) {
      continue;
    }

    if (seen_indexes.includes(i)) {
      console.log('seen index skip');
      continue;
    }

    let t_type = check_annotation_type(annotation.description);
    console.log(`${annotation.description} is of type: ${t_type}`);

    if (t_type === 'text') {
      if (break_this) {
        continue;
      }

      let used_idx = [];
      let used_pr = [];
      let xmin = findMinX(annotation.boundingPoly.vertices);
      let xmax = findMaxX(annotation.boundingPoly.vertices);
      let ymin = findMinY(annotation.boundingPoly.vertices);
      let ymax = findMaxY(annotation.boundingPoly.vertices);

      if (xmax > g_xmax / 2) {
        continue;
      }

      if ((ymax + ymin) / 2 < parsed_y) {
        continue;
      }
      let line_height = ymax - ymin;
      let current_price = null;
      current_name += annotation.description;
      let y_current = 0;
      let price_x_current = 0;
      let is_hanging = false;
      let p_description = '';
      for (let j = 0; j < sorted_annotations.length; j++) {
        let p_ann = sorted_annotations[j];
        if (i === j) {
          continue;
        }
        skip_this = false;

        for (let k = 0; k < STOPWORDS; k++) {
          let word = STOPWORDS[k];
          if (
            p_ann.description
              .toLowerCase()
              .split(' ')
              .includes(word)
          ) {
            console.log(`p skip word ${p_ann.description}`);
            skip_this = true;
          }
        }
        for (let k = 0; k < SKIPWORDS; k++) {
          let word = SKIPWORDS[k];
          if (
            p_ann.description
              .toLowerCase()
              .split(' ')
              .includes(word)
          ) {
            console.log(`p skip word ${p_ann.description}`);
            skip_this = true;
          }
        }
        for (let k = 0; k < BLACKLIST_WORDS; k++) {
          let word = BLACKLIST_WORDS[k];
          if (
            p_ann.description
              .toLowerCase()
              .split(' ')
              .includes(word)
          ) {
            console.log(`p skip word ${p_ann.description}`);
            skip_this = true;
          }
        }

        if (skip_this) {
          continue;
        }

        let p_xmin = findMinX(p_ann.boundingPoly.vertices);
        let p_xmax = findMaxX(p_ann.boundingPoly.vertices);
        let p_ymin = findMinY(p_ann.boundingPoly.vertices);
        let p_ymax = findMaxY(p_ann.boundingPoly.vertices);

        if (p_ymax < ymin || p_ymin > ymax) {
          continue;
        }

        let line_overlap =
          Math.min(p_ymax - ymin, ymax - p_ymin) / Math.max(p_ymax - p_ymin, ymax - ymin);
        if (line_overlap < 0.5) {
          continue;
        }

        p_description = '';
        if (is_hanging) {
          p_description += p_ann.description;
          is_hanging = false;
        } else {
          p_description = p_ann.description;
        }

        let p_type = check_annotation_type(p_description);
        if (p_type === 'hanging') {
          is_hanging = true;
          continue;
        }

        if (p_type === 'number') {
          if (p_xmax < g_xmax / 2) {
            continue;
          }
          if (seen_prices.includes(j)) {
            continue;
          }

          if (p_ymax < ymin || p_ymin > ymax || p_xmax < xmax || p_xmin < price_x_current) {
            if (current_price || p_ymin > ymin + 2 * line_height) {
              continue;
            }
          }

          console.log('Checking ' + p_description);
          y_current = p_ymin;
          used_pr.push(j);
          current_price = check_price(p_description);
          price_x_current = p_xmin;
          console.log('New price' + current_price);
          parsed_y = max(parsed_y, (p_ymax + p_ymin) / 2);
        } else if (p_type === 'text') {
          if (p_xmax > g_xmax / 2) {
            continue;
          }
          if (p_ymax < ymin || p_ymin > ymax || (y_current > 0 && p_ymin > y_current)) {
            continue;
          }
          used_idx.push(j);

          parsed_y = Math.max(parsed_y, (p_ymax + p_ymin) / 2);
          console.log('Appending ' + current_name + ' ' + p_description);
          current_name += ' ' + p_ann.description;
        }
      }

      console.log(current_name + ' ' + current_price);
      if (current_price) {
        seen_prices = seen_prices.concat(used_pr);
        seen_indexes = seen_indexes.conca(used_idx);
        skip_this = false;
        console.log(current_name.toLocaleLowerCase());

        if (!check_article_name(current_name)) {
          skip_this = true;
        }
        if (!skip_this) {
          console.log('Adding ' + current_name + ' ' + current_price);
          articles.push({
            name: current_name,
            price: current_price
          });
          current_name = '';
          current_price = null;
        }
      }
    } else if (t_type === 'date') {
      dates.push(parse_date(annotation.description));
    } else if (t_type === 'market') {
      if (check_market(annotation.description)) {
        markets.push(check_market(annotation.description));
      }
    }
  }

  return {
    articles,
    dates,
    markets
  };
}

export async function parse_receipt() {
  try {
    let gcloudResponse = await client.textDetection('/home/quanteon/Downloads/test1.png');
    let parsedResponse = parseResponse(gcloudResponse[0]);
    return parsedResponse;
  } catch (error) {
    throw error;
  }
}
