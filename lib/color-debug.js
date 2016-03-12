function colorDebug(message, color, newline) {
  if (!color) {
    color = '0;37';
  }

  if (newline) {
    newline = '\n';
  } else {
    newline = '';
  }

  process.stdout.write('\x1B[' + color + 'm' + message + '\x1B[0;37m'
      + newline);
}
module.exports = {
  debug: colorDebug,
  d: colorDebug
};
