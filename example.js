"use strict";

var stringParse = require('string-parse');

var parseOptions = {
  blocks: {
    stopTag: {
      start: '</',
      stop: '>',
      split: ' ',
      ignoreEmpty: true,
      handle: function(block) { return { stoptag: block}; }
    },
    startTag: {
      start: '<',
      stop: '>',
      split: ' ',
      ignoreEmpty: true,
      blocks: {
        expression: { '$ref': '/blocks/expression' },
        quotes: {
          start: '\'',
          stop: '\'',
          escapedStop: '\\\'',
          blocks: {
            expression: { '$ref': '/blocks/expression' }
          }
        },
        doubleQuotes: {
          start: '"',
          stop: '"',
          escapedStop: '\\"',
          blocks: {
            expression: { '$ref': '/blocks/expression' }
          }
        }
      },
      handle: function(block) { return { starttag: block }; }
    },
    expression: {
      start: '{{',
      escapedStart: '{{{',
      stop: '}}',
      escapedStop: '}}}',
      removeStarStop: true,
      handle: function(block) { return { expression: block}; },
      reparse: true
    }
  },
  debug: true
};

console.log(stringParse('<test blah="blahvalue" blah2="{{blah2expression part1}}" {{testblockstartexpression part1}}>{{intestblockexpression}}<inner>innertext</inner>afterinner</test>aftertest', parseOptions));
