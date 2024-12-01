# MMM-Air-Pollution
Use this template for creating new MagicMirror² modules.

See the [wiki page](https://github.com/Dennis-Rosenbaum/MMM-Template/wiki) for an in depth overview of how to get started.

# MMM-Air-Pollution

![Example of MMM-Air-Pollution](./example_1.png)

[Module description]

## Installation

### Install

In your terminal, go to your [MagicMirror²][mm] Module folder and clone MMM-Air-Pollution:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/bluerhodfa/MMM-Air-Pollution.git
```

### Update

```bash
cd ~/MagicMirror/modules/MMM-Air-Pollution
git pull
```

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```js
    {
        module: 'MMM-Air-Pollution',
        position: 'top_right'
    },
```

Or you could use all the options:

```js
   {
        module: "MMM-Air-Pollution",
        position: "top_right",
        config: {
        lat: [latitute],
        lon: [longitude],
        apiKey: "[your openweathermap.org API key]"
    }
    },
```

## Configuration options

Option|Possible values|Default|Description
------|------|------|-----------
`exampleContent`|`string`|not available|The content to show on the page

## Sending notifications to the module

Notification|Description
------|-----------
`TEMPLATE_RANDOM_TEXT`|Payload must contain the text that needs to be shown on this module

## Developer commands

- `npm install` - Install devDependencies like ESLint.
- `npm run lint` - Run linting and formatter checks.
- `npm run lint:fix` - Fix linting and formatter issues.

[mm]: https://github.com/MagicMirrorOrg/MagicMirror
