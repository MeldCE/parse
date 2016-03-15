# string-parse 0.1.0

Javascript library for parsing strings

The string parsing can consist of stripping certain
characters, splitting the string on certain characters and handling blocks
(for instance strings within quotes)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [string-parse](#string-parse)
- [Example](#example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# string-parse

Parses the given string using the given options

**Parameters**

-   `string` **string** String to parse
-   `options` **Object** Options for parsing
    -   `options.handle` **[function]** The function to pass all non-block and
               non-handled block strings to. The function will be given the string
               as the first parameter
    -   `options.handleAll` **[boolean]** Whether or not to call the handle
               function for blocks as well as non-blocks
    -   `options.context` **[Any]** Context to give to handle functions
    -   `options.debug` **[boolean or number]** If true, the string and any
               special characters (block characters, split characters etc) will be
               printed to `stdout`while parsing the string
    -   `options.split` **[string or RegExp]** Characters or regular expression to
               split string on
    -   `options.storeSplit` **[boolean or number]** Whether or not to store the
               split character. If true, the split character will be it's own
               element in the returned array. If a number (n) is given and `split`
               is a regular expression, the nth matching group will be stored
               instead of the entire matching string
    -   `options.strip` **[string or RegExp]** Characters or regular expression
               expressions to strip from outside of blocks
    -   `options.blocks` **[Array&lt;Object&gt;]** An object containing blocks (like quoted
               blocks) to not split in
        -   `options.blocks.start` **[string]** Characters that start the block
        -   `options.blocks.escapedStart` **[string]** Characters that are used to
                   represent an escaped version of the start block characters outside of
                   a block
        -   `options.blocks.stop` **[string]** Characters that end the block
        -   `options.blocks.escapedStop` **[string]** Characters that are used to
                   represent an escaped version of the end block characters within a
                   block
        -   `options.blocks.keepStartStop` **[boolean]** Whether or not to the start
                   and stop characters. The start and stop characters will be separate
                   elements in the returned parts array
        -   `options.blocks.split` **[]** Characters or regular expression to split
                   the block on
        -   `options.blocks.storeSplit` **[undefined]** 
        -   `options.blocks.ignoreEmpty` **[boolean]** Whether to ignore empty splits
        -   `options.blocks.blocks` **[undefined]** 
        -   `options.blocks.handle` **[function]** Function to call once a block has
                   been completed. The function will be passed the block as the only
                   parameter. If the `split` option is specified, the parameter will be
                   an array containing the parts of the block. If the `replace` option
                   is `true`, the block start and stop characters will be stripped from
                   the block before it is passed to the function. The function should
                   return the parsed value back.
        -   `options.blocks.reparse` **[boolean]** Whether or not to reparse the
                   returned value from the handle function.
        -   `options.blocks.replaceEscapes` **[boolean]** Whether or not to replace
                   the escaped block characters with the actual block characters (eg \"
                   to ") in the returned string

Returns **string or Array&lt;string&gt;** Returns a parsed string (if there is only one
         part to the string or and array of parsed string parts


# Example
[Try on Tonic](https://tonicdev.com/npm/string-parse)

```javascript
var stringParse = require('string-parse');

var parseOptions = {
  blocks: {
    stopTag: {
      start: '</',
      stop: '>',
      split: ' ',
      ignoreEmpty: true,
      handle: function(block) { return { stoptag: block}; },
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
      handle: function(block) { return { starttag: block }; },
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

```

