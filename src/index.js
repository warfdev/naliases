#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const os = require('os');

const program = new Command();
const aliasFilePath = path.join(__dirname, 'aliases.json');
const aliasBinPath = path.join(os.homedir(), '.alias-bin');

if (!fs.existsSync(aliasFilePath)) {
  fs.writeFileSync(aliasFilePath, JSON.stringify({}));
}

if (!fs.existsSync(aliasBinPath)) {
  fs.mkdirSync(aliasBinPath);
}

const getAliases = () => {
  const data = fs.readFileSync(aliasFilePath);
  return JSON.parse(data);
};

const saveAliases = (aliases) => {
  fs.writeFileSync(aliasFilePath, JSON.stringify(aliases, null, 2));
};

const createExecutable = (aliasName, command) => {
  const filePath = path.join(aliasBinPath, aliasName);
  const script = `#!/bin/sh\n${command}`;
  fs.writeFileSync(filePath, script, { mode: 0o755 }); // Make the file executable
};

const removeExecutable = (aliasName) => {
  const filePath = path.join(aliasBinPath, aliasName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Add Alias
program
  .command('alias --add <name> <command>')
  .description('Add a new alias')
  .action((name, command) => {
    const aliases = getAliases();
    if (aliases[name]) {
      console.log(`Alias '${name}' already exists.`);
      return;
    }
    aliases[name] = command;
    saveAliases(aliases);
    createExecutable(name, command);
    console.log(`Alias '${name}' added for command: ${command}`);
  });

// Remove Alias
program
  .command('alias --remove <name>')
  .description('Remove an alias')
  .action((name) => {
    const aliases = getAliases();
    if (!aliases[name]) {
      console.log(`Alias '${name}' does not exist.`);
      return;
    }
    delete aliases[name];
    saveAliases(aliases);
    removeExecutable(name);
    console.log(`Alias '${name}' removed.`);
  });

// List Aliases
program
  .command('alias --list')
  .description('List all aliases')
  .action(() => {
    const aliases = getAliases();
    console.log('Current Aliases:');
    console.table(aliases);
  });

program.parse(process.argv);