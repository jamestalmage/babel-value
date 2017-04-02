import test from 'ava';
import * as babel from 'babel-core';
import fn from './';

const getProgramPath = input => {
	let p;

	babel.transform(input, {
		plugins: () => ({
			visitor: {
				Program(path) {
					p = path;
				}
			}
		}),
		filename: 'some-file.js'
	});

	return p;
};

const getStatementPath = (input, idx) => getProgramPath(input).get(`body.${idx || 0}`);

const p = (input, idx) => getStatementPath(input, idx).get('expression.right');

test('literals', t => {
	t.is(fn(p(`x = 0;`)), 0);
	t.is(fn(p(`x = 0;`).node), 0);
	t.is(fn(p(`x = 1;`)), 1);
	t.is(fn(p(`x = 1;`).node), 1);
	t.is(fn(p(`x = true;`)), true);
	t.is(fn(p(`x = false;`)), false);
	t.is(fn(p(`x = 'foo';`)), 'foo');
	t.is(fn(p(`x = null;`)), null);
	t.is(fn(p(`x = undefined;`)), undefined);
});

test('objects', t => {
	t.deepEqual(fn(p(`x = {a: 3};`)), {a: 3});
	t.deepEqual(fn(p(`x = {b: 4};`).node), {b: 4});
	t.deepEqual(fn(p(`x = {c: {d: 5}};`)), {c: {d: 5}});

	t.deepEqual(fn(p(`x = /val\\w/ig`)), /val\w/ig);

	t.deepEqual(fn(p('x = `\nfoo`')), '\nfoo');
});

test('bad template usage', t => {
	t.throws(() => fn(p('x = `hello ${name}`')), 'Template literals may not contain any computed values'); // eslint-disable-line no-template-curly-in-string
});
