# Auto Format

A GitHub Action that calls your scripts to auto-format your code in a pull request if it isn't already.

## Use

For example:

```yaml
on:
  pull_request:

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: lee-dohm/auto-format@v1
        with:
          setup: npm ci
          check: npm run format-check
          format: npm run format
          token: ${{ github.token }}
```

### Inputs

- `check` **required** &mdash; Command to execute to check to see if your source is formatted
- `format` **required** &mdash; Command to execute to format your source
- `message` &mdash; Message to use for the commit, if any (_default:_ "Automated formatting")
- `setup` &mdash; Command to execute before checking the format of your source
- `token` **required** &mdash; Token to use to commit code back to the pull request

## Copyright

[MIT](LICENSE.md)
