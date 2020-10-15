function capitalizeFirstLetter(str) {
  let s = str;
  if (s === null || s === undefined) {
    s = '';
  }
  s = s.toString();
  return (s[0] || '').toUpperCase() + s.substring(1);
}

const json_validator = {
    getter(prop) {
      const val = this.getDataValue(prop);
      return val ? JSON.parse(val) : val;
    },
    setter(prop, val) {
      if (val === null || val === undefined) {
        this.setDataValue(prop, val);
      } else {
        const setVal = typeof val === 'string' ? val : JSON.stringify(val);
        this.setDataValue(prop, setVal);
      }
    }
  },
  email_validator = {
    setter(prop, val) {
      // for null allowed cases
      if (val === null) {
        this.setDataValue(prop, null);
        return;
      }

      if (!val) {
        return;
      }

      this.setDataValue(
        prop,
        val
          .toString()
          .toLowerCase()
          .trim()
      );
    }
  },
  text_validator = {
    setterTrim(prop, val) {
      if (val !== null && val !== undefined && typeof val === 'string') {
        this.setDataValue(prop, val.toString().trim());
      }
    },

    setterTrimCap(prop, val) {
      if (val !== null && val !== undefined && typeof val === 'string') {
        this.setDataValue(prop, capitalizeFirstLetter(val.toString().trim()));
      }
    }
  };

module.exports = {
  json_validator,
  email_validator,
  text_validator
};
