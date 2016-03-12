# string-parse 0.0.1

A small module for parsing strings.

The string parsing can consist of stripping certain
characters, splitting the string on certain characters and handling blocks
(for instance strings within quotes)

<!-- START doctoc -->
<!-- END doctoc -->

# Example
[Try on Tonic](https://tonicdev.com/npm/string-parse)

```javascript
var stringParse = require('./src/lib/string-parse.js');

/*var parseOptions = {
  blocks: {
    stopTag: {
      start: '</',
      stop: '>',
      split: ' ',
      ignoreEmpty: true
    },
    startTag: {
      start: '<',
      stop: '>',
      split: ' ',
      ignoreEmpty: true,
      blocks: {
        expression: { '@ref': '/blocks/expression' },
        quotes: {
          start: '\'',
          end: '\'',
          escapedStop: '\\\''
        },
        doubleQuotes: {
          start: '"',
          end: '"',
          escapedStop: '\\"'
        }
      }
    },
    expression: {
      start: '{{',
      escapedStart: '{{{',
      stop: '}}',
      escapedStop: '}}}',
      removeStarStop: true,
      handle: function(block) { console.log(block); return block; },
      reparse: true
    }
  },
  debug: true
};*/

var parseOptions = {
  blocks: {
    stopTag: {
      start: '</',
      stop: '>',
      split: ' ',
      ignoreEmpty: true
    },
    startTag: {
      start: '<',
      stop: '>',
      removeStartStop: true,
      split: /^( +|=)/,
      storeSplit: true,
      ignoreEmpty: true,
      handle: function(block) { console.log('start tag', block); return block; },
      blocks: {
        expression: {
          start: '{{',
          escapedStart: '{{{',
          stop: '}}',
          escapedStop: '}}}',
          split: ' ',
          removeStartStop: true,
          handle: function(block) { console.log(block); return block; },
          reparse: true
        },
        quotes: {
          start: '\'',
          stop: '\'',
          escapedStop: '\\\'',
          blocks: {
            expression: {
              start: '{{',
              escapedStart: '{{{',
              stop: '}}',
              escapedStop: '}}}',
              split: ' ',
              removeStartStop: true,
              handle: function(block) { console.log(block); return block; },
              reparse: true
            }
          }
        },
        doubleQuotes: {
          start: '"',
          stop: '"',
          escapedStop: '\\"',
          removeStartStop: true,
          blocks: {
            expression: {
              start: '{{',
              escapedStart: '{{{',
              stop: '}}',
              escapedStop: '}}}',
              split: ' ',
              removeStartStop: true,
              handle: function(block) { console.log(block); return block; },
              reparse: true
            }
          }
        }
      }
    },
    expression: {
      start: '{{',
      escapedStart: '{{{',
      stop: '}}',
      escapedStop: '}}}',
      split: ' ',
      removeStartStop: true,
      handle: function(block) { console.log(block); return block; },
      reparse: true
    }
  },
  debug: 1
};


console.log(stringParse('<test blah="blahvalue" blah2="{{blah2expression part1}}" {{testblockstartexpression part1}}>{{intestblockexpression}}<inner>innertext</inner>afterinner</test>aftertest', parseOptions));
```

