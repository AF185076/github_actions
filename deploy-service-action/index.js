const core = require('@actions/core');
const axios = require('axios');

async function httpRequest(url, method, headers = null, payload = null) {
    const config = {
        url: url,
        method: method,
        data: payload,
        headers: headers
    };
    try {
        const response = await axios(config);
        return response;
    } catch (error) {
        console.error(error);
    }
}


async function main() {
    try {
        const host = core.getInput('host')
        const oauth = core.getInput('oauth')
        const url = core.getInput('url');
        const method = core.getInput('method').toLowerCase();
        const data = core.getInput('payload');
        let payload
        try {
            payload = JSON.parse(data);
        } catch (error) {
            core.setFailed('Erro parsing payload ');
        }

        let token
        const headers = {'Content-type': 'Application/json'}
        if (oauth) {
            const resp = await httpRequest(host + oauth, 'get', headers);
            if (resp.status != 200) {
                core.setFailed('Authentication failed');
                return -1;
            }
            token = resp.data.token;
            if (!token) {
                core.setFailed('Authentication failed');
                return -1;
            }
        }
        if (token) {
            headers['Authorization'] = token;
        }
        const resp = await httpRequest(host + url, method, headers, payload)
        if (resp.status != 200) {
            core.setFailed('Service failed code:' + resp.status);
            return -1;
        }
        const exitCode = resp.data.exitCode;
        const output = resp.data.output;
        console.log(output);
        if (exitCode != 0) {
            core.setFailed('Service failed')
            return -1;
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();