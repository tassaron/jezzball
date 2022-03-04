/* Adaptor layer that tries to import the score button from Rainey Arcade and allows it to fail */
export let send_score, hide_send_score_button;

class MissingModule extends Error {}

const loadModule = async (modulePath) => {
    try {
        return await import(modulePath)
    } catch (e) {
        throw new MissingModule(modulePath)
    }
}

loadModule("../send_score.js").then(send_score_module => {
    send_score = send_score_module.send_score;
    hide_send_score_button = send_score_module.hide_send_score_button;
}).catch((e) => {
    console.log("Failed to import score button functionality");
    send_score = () => null;
    hide_send_score_button = () => null;
})