# Explorata

## What is it? 

Explore your Facebook Messenger data with fun and meaningful visualisations. 

Explorata is open-source and built upon the “privacy by design” principle. All data is processed locally — it even works offline.

We aim to develop Explorata to accept more kinds of social data soon.  

## How does it work?

1. Download Explorata
2. Download your data from Facebook (see how)
3. Unzip your Facebook data folder and drop the ‘messages’ folder onto Explorata
4. Dive into your data! 

## Why did we build it?

Ever wondered who are the people you message most? With whom you have the longest streaks? The day you exchanged most messages? Why?

We have been on Facebook for years, exchanged thousands of messages and yet, stuck on their servers, our data remains unexplorable.

## Features

- Local processing of data (privacy-by-design)
- Fun visualisations like most messaged people, streaks, chattiest days, and more!
- Click on a person or a visualisation to see your conversations in context!

## Stack

<p>
  Explorata is based out of the Electron React Boilerplate, and uses <a href="hhttps://electron-react-boilerplate.js.org">Electron Boilerplate</a> with <a href="https://facebook.github.io/react/">React</a>, <a href="https://github.com/reactjs/redux">Redux</a>, <a href="https://ant.design">Ant.design</a>, <a href="http://recharts.org">Recharts</a> and <a href="https://github.com/react-dropzone/react-dropzone">React Dropzone</a>.
</p>

## Install

## Starting Development

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
$ yarn dev
```

## Packaging for Production

To package apps for the local platform:

```bash
$ yarn package
```
