const fs = require('fs');
const path = require('path');

describe('Firestore Rules Validation', () => {
  const rulesPath = path.join(__dirname, '../../firestore.rules');

  test('rules file exists', () => {
    expect(fs.existsSync(rulesPath)).toBe(true);
  });

  test('rules have correct version', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');
    expect(rules).toContain('rules_version = \'2\';');
  });

  test('rules have all required collections', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');

    // Verifica collections essenciais
    expect(rules).toContain('match /refinements/{refinementId}');
    expect(rules).toContain('match /cards/{cardId}');
    expect(rules).toContain('match /users/{userId}');
    expect(rules).toContain('match /timers/{timerId}');
    expect(rules).toContain('match /uuidMappings/{mappingId}');
  });

  test('rules have security functions', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');

    // Verifica funções de segurança
    expect(rules).toContain('function isSignedIn()');
    expect(rules).toContain('function isOwner(userId)');
    expect(rules).toContain('function isRefinementOwner()');
    expect(rules).toContain('function isCardOwner()');
    expect(rules).toContain('function hasValidRefinementStructure()');
    expect(rules).toContain('function hasValidUserStructure()');
  });

  test('refinements collection has proper rules', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');

    // Verifica regras específicas para refinements
    expect(rules).toContain('allow read: if isSignedIn()');
    expect(rules).toContain('allow create: if isSignedIn() && hasValidRefinementStructure()');
    expect(rules).toContain('allow delete: if isSignedIn() && isRefinementOwner()');
  });

  test('cards collection has proper rules', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');

    expect(rules).toContain('allow delete: if isSignedIn() && isCardOwner()');
  });

  test('users collection has proper rules', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');

    expect(rules).toContain('allow read: if isSignedIn() && isOwner(userId)');
    expect(rules).toContain('allow update: if isSignedIn() && isOwner(userId) && hasValidUserStructure()');
  });

  test('rules have data validation', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');

    // Verifica validações de dados
    expect(rules).toContain('request.resource.data.title is string');
    expect(rules).toContain('request.resource.data.title.size() >= 3');
    expect(rules).toContain('request.resource.data.displayName is string');
    expect(rules).toContain('request.resource.data.displayName.size() >= 1');
  });

  test('rules structure is complete', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');

    // Verifica estrutura completa
    const lines = rules.split('\n');
    const essentialPatterns = [
      'service cloud.firestore',
      'match /databases/{database}/documents',
      'function isSignedIn()',
      'match /refinements/{refinementId}',
      'match /cards/{cardId}',
      'match /users/{userId}'
    ];

    essentialPatterns.forEach(pattern => {
      expect(rules).toContain(pattern);
    });
  });

  test('rules have authentication checks', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');
    expect(rules).toContain('request.auth != null');
  });

  test('rules have owner validation', () => {
    const rules = fs.readFileSync(rulesPath, 'utf8');
    expect(rules).toContain('request.auth.uid == userId');
    expect(rules).toContain('request.auth.uid == resource.data.owner');
  });
});