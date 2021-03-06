var stringParse = require('../lib/string-parse');

it('should return a basic string with no options', function() {
  expect(stringParse('this string', {})).toEqual('this string');
});

describe('string splitting', function() {
  it('should split a string with split option as string', function() {
    expect(stringParse('this string', {
      split: ' '
    })).toEqual(['this', 'string']);
  });
  
  it('should split a string with split option as regex', function() {
    expect(stringParse('this string=string', {
      split: /^[ =]/,
    })).toEqual(['this', 'string', 'string']);
  });
});

describe('character stripping', function() {
  it('should strip characters with strip option as array of strings',
      function() {
    expect(stringParse('hello!', {
      strip: ['o', 'e']
    })).toEqual('hll!');
  });
  
  it('should strip characters with strip option as array of regexs',
      function() {
    expect(stringParse('hello!', {
      strip: [/^l/, /^!/]
    })).toEqual('heo');
  });
});

describe('handle functions', function() {
  it('should call the handle on non-block parts if no handleAll', function() {
    expect(stringParse('val1,val2<val2a>,val3', {
      split: ',',
      blocks: {
        block: {
          start: '<',
          stop: '>'
        }
      },
      handle: function(block) { return block + '!'; }
    })).toEqual(['val1!', 'val2!', 'val2a', 'val3!']);
  });
});

describe('blocks', function() {
  it('should not split in block', function() {
    expect(stringParse('val1,"val,2",val3', {
      split: ',',
      blocks: {
        quotes: {
          start: '"',
          stop: '"'
        }
      }
    })).toEqual(['val1', 'val,2', 'val3']);
  });

  it('should keep the block characters if told to', function() {
    expect(stringParse('val1,"val,2",val3', {
      split: ',',
      blocks: {
        quotes: {
          start: '"',
          stop: '"',
          keepStartStop: true
        }
      }
    })).toEqual(['val1', ['"', 'val,2', '"'], 'val3']);
  });

  it('should pass a block to a handle function', function() {
    expect(stringParse('val1,"val,2",val3', {
      split: ',',
      blocks: {
        quotes: {
          start: '"',
          stop: '"',
          keepStartStop: true,
          handle: function(block) { return [ block ]; }
        }
      }
    })).toEqual(['val1', [ ['"', 'val,2', '"'] ], 'val3']);
  });

  it('should not reparse if handle doesn\'t return string', function() {
    expect(stringParse('val1,"val,2",val3', {
      split: ',',
      blocks: {
        quotes: {
          start: '"',
          stop: '"',
          keepStartStop: true,
          handle: function(block) { return [ block ]; },
          reparse: true
        }
      }
    })).toEqual(['val1', [ ['"', 'val,2', '"'] ], 'val3']);
  });

  it('should reparse string returned from handle if told', function() {
    expect(stringParse('val1,"val,2",val3', {
      split: ',',
      blocks: {
        quotes: {
          start: '"',
          stop: '"',
          handle: function(block) { return block[0]; },
          reparse: true
        }
      }
    })).toEqual(['val1', 'val', '2', 'val3']);
  });
});
