const modulesToTransform = ['@ubi/js-utils', 'emittery'] // ESM modules to be transformed into CommonJS
const lookAheads = modulesToTransform.map((name) => `(?!${name})`).join('')
const modulesIgnorePattern = `/node_modules/${lookAheads}`

module.exports = {
    verbose: true,
    preset: 'ts-jest/presets/js-with-ts-legacy',
    testEnvironment: 'node',
    transformIgnorePatterns: [modulesIgnorePattern],
}
