
// GET OUR DATA FROM LOCAL JSON
async function loadDeposit() {
    // load all properties
    const response = await fetch("./data/properties.json");
    const properties = await response.json();
    console.log('properties: ', properties);

    // find the deactivated properties
    let deactivated = []
    for(const property of properties) {
        if (property.status === "deactivated") {
            deactivated.push(property.account_id)
        }
    }
    console.log('deactivated: ', deactivated)

    // load all users
    const res = await fetch("./data/users.json");
    const users = await res.json();
    console.log('users: ', users);

    // find users associated with the deactivated properties
    let matches = {}
    for(const id in deactivated) {
            matches[deactivated[id]] = users.filter(user => id in user.associated_accounts)
        }
        console.log('matches: ', matches)

    // loop through the matches to find & return unique user info (based on id, but could also use email)
    // would like to make this more efficient, but this works for now
    let deposit = {}
    for (const i in matches) {
        for(const j of matches[i]) {
            let userInfo = {
                'vid': j.id,
                'properties': {
                    'first_name': j.first_name,
                    'last_name': j.last_name,
                    'company': j.company,
                    'company_domain': j.company_domain,
                    'email': j.email,
                    'phone': j.phone
                }
            }
        deposit[j.id] = userInfo
        }
    }
    // alternative solution to finding unique user info based on email - not ideal if a user's updated info includes a new email
    // let unique = [...new Map(deposit.map((user) => [user["email"], user])).values()];

    console.log('deposit: ', deposit)
    return deposit
    // not sure when the data should be converted to JSON...here or below?
    // return JSON.stringify(deposit)
}
// loadDeposit();

// invoke existing api_call method based on some assumptions
    const hapikey = 'demo'
    const data = loadDeposit()
    const dataLength = Object.keys(data).length
    const getUrl = () => {
        let error;
        if ( dataLength < 100) {
            batchUrl = `https://api.hubapi.com/contacts/v1/contact/batch/?hapikey=${hapikey}`
        }else{
            error = 'Data set is too large to update in one batch. Please separate into batches of 100 or less'
            console.log(error)
        }
        return error, batchUrl
    }
    const assumptions = {
        method: 'POST',
        url: getUrl(),
        headers: {
            Authorization: 'Bearer',
            'Content-Type': 'application/json'
        },
        body: data,
        json: true
    };

    // Post our data to the existing list
    const id = 202210
    const postUrl = `https://api.hubapi.com/contacts/v1/lists/${id}/add?hapikey=${hapikey}`
    const axios = require('axios').default;
    const postData = async data => {
        try {
            const response = await axios.post(postUrl, data);
            const newData = response.data;

            console.log('Users have been posted!', newData);

            return newData;
        } catch (errors) {
            console.error(errors);
        }
        return errors;
    }
