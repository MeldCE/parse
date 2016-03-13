'use strict';

let iD = require('./color-debug.js').debug;
let skemer = require('skemer');

let stringParseOptions = require('./options.js');

/**
 * Parses the given string using the given options
 * @param {string} string String to parse
 * @param {Object} options Options for parsing
%%stringParseOptions%%
 *
 * @returns {string|string[]} Returns a parsed string (if there is only one
 *          part to the string or and array of parsed string parts
 */
module.exports = function stringParse(string, options) {
  var parts = [''], currentPart = 0;

  var inBlocks = [];

  var b, last = 0, i = 0;
  
  //options = skemer.validateNew({ schema: stringParseOptions }, options);

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

  // Set up initial environment
  // Stores the stack of block
  var stack = [];
  // Stores the stack of strings (used for reprocessing of blocks after handle
  var stringStack = [];
  // The current position within the current string
  var i = 0;
  var current = {
    block: options,
    start: 0, // Stores the first character position of the current string
    parts: [], // Stores the strings
    part: [] //Stores the chunks of the current string
  }

  function resetString() {
    // Finish current string
    if (current.start !== i) {
      current.part.push(string.slice(current.start, i));
    }

    // Reset to previous string
    string = stringStack.pop();
    i = string.i;
    string = string.string;
    current.start = i

    if (options.debug) iD('%%reset string%%');

    return i < string.length;
  }

  parse: while(i < string.length || (stringStack.length && resetString())) {
    //if (options.debug === 1) iD(string[i], '0;33');
    // Check for escape characters
    if (current.block.escapedStop
        && (string.substr(i, current.block.escapedStop.length)
        === current.block.escapedStop)) {
      if (options.debug) iD((options.debug === 1 ? '%%Found an escaped stop in block ' + b + '%%' : '')
          + current.block.escapedStop, '0;34');
      if (current.start !== i) {
        current.part.push(string.slice(current.start, i));
      }
      if (current.block.replaceEscapes) {
        // Push string before into part along with stop character
        current.part.push(current.block.stop);
        current.start = i + current.block.escapedStop.length;
      }
      i = i + current.block.escapedStop.length;
      continue;
    }
    // Check for stop character
    if (current.block.stop
        && string.substr(i, current.block.stop.length) === current.block.stop) {
      if (options.debug) iD((options.debug === 1 ? '%%Found a stop for block ' + current.name + '%%' : '')
      + current.block.stop, '1;31');
      
      if (current.start !== i) {
        current.part.push(string.slice(current.start, i));
      }

      // Push part into parts
      if (current.part.length) {
        current.parts.push((current.part.length > 1 ? current.part.join('') : current.part[0]));
        current.part = [];
      }

      if (current.block.keepStartStop) {
        current.parts.push(current.block.stop);
      }
      if (options.debug === 1) iD('%%Parts of ' + current.name + ' is ' + current.parts + '%%');
      let output = current.parts;

      i = i + current.block.stop.length;

      if (current.block.handle) {
        // TODO handle replacement parsing
        output = current.block.handle(current.parts);
        
        if (current.block.reparse && typeof output === 'string') {
          // Store current string
          stringStack.push({
            string: string,
            i: i
          });
          string = output;
          i = 0;
          // False output so it isn't appended to parts
          output = false;
        }
      } else {
        if (output instanceof Array && output.length === 1) {
          output = output[0];
        }
      }

      // Pop the outer block off the stack
      current = stack.pop();
      if (options.debug) iD('%%block is now ' + (current.name || 'root') + '%%');
      
      current.start = i;

      if (output) {
        if (!stack.length && current.block.handle && current.block.handleAll) {
          output = current.block.handle(output);
        }
        current.parts.push(output);
      }
      continue;
    }
    // Check if the character is a block character
    if (current.block.blocks) {
      for (b in current.block.blocks) {
        // Check for a escaped start
        if (current.block.blocks[b].escapedStart
            && string.substr(i, current.block.blocks[b].escapedStart.length) === current.block.blocks[b].quote) {
          if (options.debug) iD((options.debug === 1 ? '%%Found a quote in block ' + b + '%%' : '')
          + current.block.blocks[b].escapedStart, '0;34');
          if (current.start !== i) {
            current.part.push(string.slice(current.start, i));
          }
          if (current.block.replaceEscapes) {
            // Push string before into part along with start character
            current.part.push(current.block.start);
            current.start = i + current.block.escapedStart.length;
          }
          i = i + current.block.blocks[b].escapedStart.length;
          continue parse;
        }

        // Check if start character for block
        if ((current.block.blocks[b].start.length > 1 ? string.substr(i, current.block.blocks[b].start.length)
            : string[i]) === current.block.blocks[b].start) {
          if (options.debug) iD((options.debug === 1 ? '%%Found a start for block ' + b + '%%' : '')
              + current.block.blocks[b].start, '1;32');
          // Finish part and push into parts
          if (current.start !== i) {
            current.part.push(string.slice(current.start, i));
          }
          if (current.part.length && !(current.block.blocks[b].handle 
              && current.block.blocks[b].reparse)) {
            // Run handle function if in root
            let part = (current.part.length > 1 ? current.part.join('') : current.part[0]);
            if (!stack.length && current.block.handle) {
              part = current.block.handle(part);
            }
            current.parts.push(part);
            current.part = [];
          }

          // Store current block and create new block
          stack.push(current);
          current = {
            name: b,
            block: current.block.blocks[b],
            start: i + current.block.blocks[b].start.length,
            parts: (current.block.blocks[b].keepStartStop
                ? [current.block.blocks[b].start] : []),
            part: []
          }
          i = current.start;
          continue parse;
        }
      }
    }

    if (current.block.split) {
      // Check for split character
      if (typeof current.block.split === 'string') {
        if ((current.block.split.length > 1 ? string.substr(i, current.block.split.length)
            : string[i]) === current.block.split) {
          if (options.debug) iD((options.debug === 1 ? '%%Found a split character%%' : '')
              + current.block.split, '1;36');
          // Finish part and push into parts
          if (current.start !== i) {
            current.part.push(string.slice(current.start, i));
          }
          if (current.part.length) {
            // Run handle function if in root
            let part = (current.part.length > 1 ? current.part.join('') : current.part[0]);
            if (!stack.length && current.block.handle) {
              part = current.block.handle(part);
            }
            current.parts.push(part);
            current.part = [];
          }

          // Store split character
          if (typeof current.block.storeSplit === 'number'
              ||current.block.storeSplit) {
            current.parts.push(current.block.split);
          }

          current.part = [];
          i = i + current.block.split.length;
          current.start = i;
          continue parse;
        }
      } else if (current.block.split instanceof RegExp) {
        var match;
        if (match = current.block.split.exec(string.slice(i))) {
          if (options.debug) iD((options.debug === 1 ? '%%Found a split regex%%' : '') + match[0], '1;36');
          
          // Finish part and push into parts
          if (current.start !== i) {
            current.part.push(string.slice(current.start, i));
          }
          if (current.part.length) {
            current.parts.push((current.part.length > 1 ? current.part.join('') : current.part[0]));
            current.part = [];
          }

          // Store split character
          if (typeof current.block.storeSplit === 'number'
              || current.block.storeSplit) {
            current.parts.push(match[
              (typeof current.block.storeSplit === 'number'
                  && current.block.storeSplit >= 0
                  && current.block.storeSplit < match.length
                  ? current.block.storeSplit : 0)
              ]);
          }

          current.part = [];
          i = i + match[0].length;
          current.start = i;
          continue parse;
        }
      }
    }

    // Check for strip characters
    if (current.block.strip) {
      let s;
      for (s in current.block.strip) {
        if (typeof current.block.strip[s] === 'string') {
          if ((current.block.strip[s].length > 1 ? string.substr(i, current.block.strip[s].length)
              : string[i]) === current.block.strip[s]) {
            if (options.debug) iD((options.debug === 1 ? '%%Found a to strip character%%' : '')
                + current.block.strip[s], '0;35');
            
            // Push current string into part
            if (current.start !== i) {
              current.part.push(string.slice(current.start, i));
            }

            i = i + current.block.strip[s].length;
            current.start = i;
            continue parse;
          }
        } else if (current.block.strip[s] instanceof RegExp) {
          var match;
          if (match = current.block.strip[s].exec(string.slice(i))) {
            if (options.debug) iD((options.debug === 1 ? '%%Found a to strip regex%%' : '')
                + match[0], '0;35');
            
            // Push current string into part
            if (current.start !== i) {
              current.part.push(string.slice(current.start, i));
            }

            i = i + match[0].length;
            current.start = i;
            continue parse;
          }
        }
      }
    }

    if (options.debug) iD(string[i], (inBlocks.length ? '0;37' : '1;37'));
    i++;
  }

  // Close all open blocks or error??


  // Add rest to the parts
  if (current.start !== i) {
    current.part.push(string.slice(current.start));
  }

  if (current.part.length) {
    // Run handle function if in root
    let part = (current.part.length > 1 ? current.part.join('') : current.part[0]);
    if (!stack.length && current.block.handle) {
      part = current.block.handle(part);
    }
    current.parts.push(part);
  }

  if (options.debug) console.log('');

  switch (current.parts.length) {
    case 0:
      return '';
    case 1:
      return current.parts[0];
    default:
      return current.parts;
  }
};

module.exports.stringParseOptions = stringParseOptions;

