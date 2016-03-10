'use strict';

let iD = require('./color-debug.js').debug;
let skemer = require('skemer');

let parsedSplitSchema = {
  type: {
    split: {
      description: 'Characters or regular expression to split string on',
      types: {
        string: {
          type: 'string',
        },
        regex: {
          type: 'RegExp'
        }
      }
    },
    stripChars: {
      description: 'Characters or regular expression expressions to strip '
          + 'from outside of blocks',
      types: {
        string: {
          type: 'string',
        },
        regex: {
          type: 'RegExp'
        }
      },
      multiple: true,
      object: true
    },
    blocks: {
      description: 'An object containing blocks (like quoted blocks) to not '
          + 'split in',
      type: {
        start: {
          description: 'Characters that start the block',
          type: 'string'
        },
        escapedStart: {
          description: 'Characters that are used to represent an escaped '
              + 'version of the start block characters outside of a block',
          type: 'string'
        },
        stop: {
          description: 'Characters that end the block',
          type: 'string'
        },
        escapedStop: {
          description: 'Characters that are used to represent an escaped '
              + 'version of the end block characters within a block',
          type: 'string'
        },
        replaceEscapes: {
          description: 'Whether or not to replace the escaped block '
              + 'characters with the actual block characters (eg \\" to ") '
              + 'in the returned string',
          type: 'boolean'
        },
        split: {
          description: 'Characters or regular expression to split the block '
              + 'on',
          types: { '@ref': '/type/split/types' }
        },
        ignoreEmpty: {
          description: 'Whether to ignore empty splits',
          type: 'boolean'
        },
        blocks: { '@ref': '/type/blocks' },
        handle: {
          description: 'Function to call once a block has been completed. '
              + 'The function will be passed the block as the only parameter. '
              + 'If the `split` option is specified, the parameter will be an '
              + 'array containing the parts of the block. If the `replace` '
              + 'option is `true`, the block start and stop characters '
              + 'will be stripped from the block before it is passed to the '
              + 'function. The function should return the parsed value back.',
          type: 'function'
        },
        reparse: {
          description: 'Whether or not to reparse the returned value from the '
              + 'handle function.'
          type: 'boolean'
        }
      },
      multiple: true,
      object: true
    },
    debug: {
      description: 'If true, the string and any special characters (block '
          + 'characters, split characters etc) will be printed to `stdout`'
          + 'while parsing the string',
      types: {
        verbose: {
          type: 'boolean'
        },
        debug: {
          type: 'number',
          values: [1]
        }
      }
    }
  }
};

/**
 *
 * @param {string} string String to parse
 * @param {Object} options Options for parsing
 */
module.exports = function parsedSplit(string, options) {
  var parts = [''], currentPart = 0;

  var inBlocks = [];

  var b, last = 0, i = 0;
  
  options = skemer.validateNew({ schema: parsedSplitSchema }, options);

  // Rewrite regexps so that they have ^
  if (options.split instanceof RegExp) {
    if (!options.split.toString().startsWith('/^')) {
      options.split = new RegExp(options.split.toString().replace(/^\/(.*)\/$/, '^$1'));
    }
  }

  if (options.stripChars) {
    let s;
    for (s in options.stripChars) {
      if (options.stripChars instanceof RegExp) {
        if (!options.stripChars.toString().startsWith('/^')) {
          options.stripChars = new RegExp(options.stripChars.toString().replace(/^\/(.*)\/$/, '^$1'));
        }
      }
    }
  }
  
  if (options.debug) console.log('');

  // Break up SQL into parts
  parse: while(i < string.length) {
    //if (options.debug === 1) iD(string[i], '0;33');
    // Check if the character is a block character
    for (b in options.blocks) {
      //if (inBlocks.length) console.log(b, inBlocks[inBlocks.length-1]);
      // Check if in a block that doesn't allow suboptions.blocks
      if (inBlocks.length) {
        if (b !== inBlocks[inBlocks.length-1]) {
          if (!options.blocks[inBlocks[inBlocks.length-1]].subBlocks) {
            // Next character and continue
            continue;
          }
        } else {
          // Check if currently a block of this type
          // Check for a quote
          if (options.blocks[b].quote
              && string.substr(i, options.blocks[b].quote.length) === options.blocks[b].quote) {
            if (options.debug) iD((options.debug === 1 ? '%%Found a quote in block ' + b + '%%' : '')
            + options.blocks[b].quote, '0;34');
            i = i + options.blocks[b].quote.length;
            continue parse;
          }
          // Check for blackslash
          //if (backslash
          // Check for a stop
          if ((options.blocks[b].stop.length > 1 ? string.substr(i, options.blocks[b].stop.length)
              : string[i]) === options.blocks[b].stop) {
            // Remove block and continue
            if (options.debug) iD((options.debug === 1 ? '%%Found a stop for block ' + b + '%%' : '')
            + options.blocks[b].stop, '1;31');
            inBlocks.pop();
            i = i + options.blocks[b].stop.length;
            continue parse;
          }

          if (!options.blocks[b].subBlocks) {
            // Next character and continue
            if (options.debug) process.stdout.write(string[i]);
            i++;
            continue parse;
          }
        }
      }
      
      // Check if start character for block
      if ((options.blocks[b].start.length > 1 ? string.substr(i, options.blocks[b].start.length)
          : string[i]) === options.blocks[b].start) {
        if (options.debug) iD((options.debug === 1 ? '%%Found a start for block ' + b + '%%' : '')
            + options.blocks[b].start, '1;32');
        i = i + options.blocks[b].start.length;
        inBlocks.push(b);
        continue parse;
      }
    }

    if (!inBlocks.length) {
      // Check for split character
      if (typeof options.split === 'string') {
        if ((options.split.length > 1 ? string.substr(i, options.split.length)
            : string[i]) === options.split) {
          if (options.debug) iD((options.debug === 1 ? '%%Found a split character%%' : '')
              + options.split, '1;36');
          // Split and store command
          parts[currentPart++] += string.slice(last, i);
          parts[currentPart] = '';
          // Skip over options.split characters
          i = i + options.split.length;
          last = i;
          continue parse;
        }
      } else if (options.split instanceof RegExp) {
        var match;
        if (match = options.split.exec(string.slice(i))) {
          if (options.debug) iD((options.debug === 1 ? '%%Found a split regex%%' : '') + match[0], '1;36');
          // Split and store command
          parts[currentPart++] += string.slice(last, i);
          parts[currentPart] = '';
          // Skip over options.split characters
          i = i + match[0].length;
          last = i;
          continue parse;
        }
      }

      // Check for strip characters
      let s;
      for (s in options.stripChars) {
        if (typeof options.stripChars[s] === 'string') {
          if ((options.stripChars[s].length > 1 ? string.substr(i, options.stripChars[s].length)
              : string[i]) === options.stripChars[s]) {
            if (options.debug) iD((options.debug === 1 ? '%%Found a to strip character%%' : '')
                + options.stripChars[s], '0;35');
            // Split and store command
            parts[currentPart] += string.slice(last, i);
            // Skip over options.stripChars[s] characters
            i = i + options.stripChars[s].length;
            last = i;
            continue parse;
          }
        } else if (options.stripChars[s] instanceof RegExp) {
          var match;
          if (match = options.stripChars[s].exec(string.slice(i))) {
            if (options.debug) iD((options.debug === 1 ? '%%Found a to strip regex%%' : '')
                + match[0], '0;35');
            // Split and store command
            parts[currentPart] += string.slice(last, i);
            // Skip over options.stripChars[s] characters
            i = i + match[0].length;
            last = i;
            continue parse;
          }
        }
      }
    }

    if (options.debug) iD(string[i], (inBlocks.length ? '0;37' : '1;37'));
    i++;
  }

  // Add rest to the parts
  parts[currentPart] += string.slice(last);

  return parts;
};
