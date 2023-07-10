const Discord = require('discord.js');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const { promisify } = require('util');

const bot = new Discord.Client();
const githubUsername = 'itsfelipeh';
const githubToken = '';
const repoName = 'apchile';

const readFileAsync = promisify(fs.readFile);

function getDataFromUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });

            res.on('error', (error) => {
                reject(error);
            });
        });
    });
}

bot.on('message', async (message) => {
    if (message.content.startsWith('!sendToGitHub')) {
        const args = message.content.split(' ').slice(1);

        const fileName = args[0];
        const commitMessage = args[1];
        const url = args[2];

        try {
            const fileContent = await getDataFromUrl(url);
            const base64Content = Buffer.from(fileContent).toString('base64');

            const response = await axios.get(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${fileName}`, {
                headers: {
                    'Authorization': `token ${githubToken}`
                }
            });

            const sha = response.data.sha;

            const updateFileResponse = await axios.put(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${fileName}`, {
                message: commitMessage,
                content: base64Content,
                sha: sha
            }, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                }
            });

            message.reply('Archivo enviado a GitHub exitosamente!');
        } catch (error) {
            console.error(error);
            message.reply('Hubo un error al enviar el archivo a GitHub.');
        }
    }
});

bot.login('');
