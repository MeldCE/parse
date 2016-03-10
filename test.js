var stringParse = require('./src/lib/string-parse.js');

var parseOptions = {
  blocks: {
    stopTag: {
      start: '</',
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
    startTag: {
      start: '<',
      stop: '>',
      split: ' ',
      ignoreEmpty: true,
      blocks: { '@ref': '/blocks/stopTag/blocks' }
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
};


stringParse('<test>{{dsfds}}</test>', parseOptions);
