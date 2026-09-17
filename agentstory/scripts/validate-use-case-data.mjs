import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'agent-course-deck');
const catalogPath = path.join(root, 'data/use-cases/catalog.json');
const industryPath = path.join(root, 'data/use-cases/industries/fashion-retail.json');
const customerPath = path.join(root, 'data/use-cases/customers/arket.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function checkRequiredShape(obj, keys, label) {
  for (const key of keys) {
    if (!(key in obj)) {
      throw new Error(`${label} missing required key: ${key}`);
    }
  }
}

const catalog = loadJson(catalogPath);
const industry = loadJson(industryPath);
const customer = loadJson(customerPath);

checkRequiredShape(catalog, ['schemaVersion', 'catalogVersion', 'meta', 'registries', 'useCases'], 'catalog');
checkRequiredShape(industry, ['schemaVersion', 'id', 'name', 'useCases'], 'industry profile');
checkRequiredShape(customer, ['schemaVersion', 'id', 'name', 'industryId', 'useCases'], 'customer profile');

const catalogIds = new Set(catalog.useCases.map((useCase) => useCase.id));
const industryIds = new Set(industry.useCases.map((entry) => entry.useCaseId));
const customerIds = new Set(customer.useCases.map((entry) => entry.useCaseId));

for (const id of industryIds) {
  if (!catalogIds.has(id)) {
    throw new Error(`Industry profile references unknown use case: ${id}`);
  }
}

for (const id of customerIds) {
  if (!catalogIds.has(id)) {
    throw new Error(`Customer profile references unknown use case: ${id}`);
  }
}

for (const profile of [industry.useCases, customer.useCases]) {
  const seenOrders = new Set();
  for (const entry of profile) {
    if (seenOrders.has(entry.order)) {
      throw new Error(`Duplicate order value detected within a profile: ${entry.order}`);
    }
    seenOrders.add(entry.order);
  }
}

const enabledUseCases = customer.useCases.filter((entry) => entry.enabled).map((entry) => entry.useCaseId);
if (enabledUseCases.length !== 5) {
  throw new Error(`Expected 5 enabled use cases for Arket but found ${enabledUseCases.length}`);
}

console.log('Validated schema files:');
console.log(`- catalog: ${catalog.useCases.length} use cases`);
console.log(`- industry profile: ${industry.useCases.length} entries`);
console.log(`- customer profile: ${customer.useCases.length} entries`);
console.log(`- enabled customer use cases: ${enabledUseCases.join(', ')}`);
