# Reusable Agent Use-Case Schema

This folder defines a reusable use-case catalog that can be layered by industry and customer.

## Design

The structure uses a clear resolution order:

1. Base catalog
2. Industry defaults
3. Customer overrides

The final output for a given customer is built by merging the catalog with the selected industry profile and customer profile. The customer profile wins last.

## Base catalog

The base catalog contains reusable, industry-neutral definitions for use cases. It is intentionally separated from brand or customer wording where possible.

## Industry profile

Industry profiles define default configuration for the selected industry, including which use cases are enabled and in what order.

## Customer profile

Customer profiles define a customer-specific selection and override layer. They can disable use cases, reorder them, and override narrative text, prompts, or workflow details without duplicating the whole base catalog.

## Merge rules

- Omitted fields inherit from the previous layer.
- Array values replace the prior layer when present.
- Stable IDs are used for use cases, work patterns, connectors, and limitations.
- Customer profiles override industry defaults, which override the base catalog.

## Example

The initial base catalog includes five ARKET-like retrospective use cases:

- campaign
- store
- copy
- review
- signals

These are then selected and ordered through the fashion retail industry profile and the ARKET customer profile.
