const dsv = require('./get_dsv.js');

test('throws invalid number', async () => {
  await expect(dsv('foo')).rejects.toThrow('milliseconds not a number');
});
