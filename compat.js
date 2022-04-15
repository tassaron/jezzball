/*
* Compatibility with Rainey Arcade's score-submission feature
* Contains code copy-pasted from the modules lazily loaded by lazy_compat.js
* TODO: Share this code across repos better
*/

/**
 * Animates DOM element to reduce its opacity and height over time. Use callback to remove from DOM
 * @param {HTMLElement} element - DOM node to operate on
 */
let then;
export function animateVanish(element, callback) {
    if (then === undefined) {
        then = Date.now();
    }
    let delta = Math.min((Date.now() - then) / (1000 / 60), 2);
    then = Date.now();
    const opacity = window
        .getComputedStyle(element)
        .getPropertyValue("opacity");
    if (opacity <= 0.0) {
        callback();
        return;
    }
    let height = window.getComputedStyle(element).getPropertyValue("height");
    height = Number(height.substring(0, height.length - 2));
    const vanish = (node) => {
        node.setAttribute(
            "style",
            `opacity: ${opacity - 0.1 * delta}; height: ${height - height * 0.25 * delta
            }px`
        );
    };
    vanish(element);
    requestAnimationFrame(() => animateVanish(element, callback));
}

/*
 * Actually sends score when button is clicked
*/
export const send_score = function(filename, score, token) {
    fetch("/token/submit", {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ filename: filename, score: score }),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json",
            "X-CSRFToken": token,
        }),
    }).then(
        response => response.ok ? response.json() : null
    ).then((response) => {
        if (!response) {
            return;
        }

        // Create a floating alert
        const alertArea = document.getElementById("score-alert-area");
        const updaterMessage = document.createElement("span");
        const tokenNode = document.getElementById("arcade_tokens");
        const old_value = Number(tokenNode.innerText);
        const new_value = old_value + response["payout"];
        let alert_message;

        updaterMessage.setAttribute(
            "class",
            "p-2 text-center alert alert-warning cart-alert"
        );
        updaterMessage.setAttribute("data-timestamp", Date.now());

        if (response["payout"] < 1) {
            updaterMessage.setAttribute(
                "class",
                "p-2 text-center alert alert-warning cart-alert"
            );
            alert_message = "Score too low";
        } else {
            updaterMessage.setAttribute(
                "class",
                "p-2 text-center alert alert-success cart-alert"
            );
            alert_message = `Got ${response["payout"]} token`;            
        }
        if (response["payout"] > 1) {
            alert_message += "s";
        }
        updaterMessage.innerText = alert_message;
        alertArea.appendChild(updaterMessage);

        // Make the alert disappear later
        const doAnimation = () => {
            requestAnimationFrame(() =>
                animateVanish(updaterMessage, () => {
                    alertArea.removeChild(updaterMessage);
                })
            );
        };
        setTimeout(doAnimation, 3000);

        // Update the non-floating banner
        if (response["payout"] < 1) return;
        tokenNode.innerText = new_value;
        if (new_value == 1 || old_value == 1) {
            // pluralize/depluralize the human language (a strange one indeed)
            const tokenWordNode = document.getElementById("arcade_tokens_word");
            tokenWordNode.innerText = new_value == 1 ? (
                tokenWordNode.innerText.substring(0, tokenWordNode.innerText.length - 1)
            ) : (
                tokenWordNode.innerText + "s"
            )
        }
        tokenNode.parentElement.classList.remove("d-none");
    });
}


export function create_show_send_score_button(score) {
    return () => {
        // If embedded on Rainey Arcade, integrate with the send_score_button
        const send_score_button = document.getElementById("send_score_button");
        if (send_score_button) {
            function sendScore(e) {
                send_score(
                    document.getElementById("game_title").dataset.filename,
                    score,
                    send_score_button.dataset.csrfToken,
                );
                e.currentTarget.setAttribute("style", "display: none;");
                e.currentTarget.removeEventListener("click", sendScore);
                e.stopPropagation();
            }
            send_score_button.setAttribute("style", "z-index: 100; display: block; left: 50%; bottom: 30%; transform: translate(-50%);");
            send_score_button.addEventListener("click", sendScore);
        }
    };
}


export const hide_send_score_button = function() {
    const send_score_button = document.getElementById("send_score_button");
    if (!send_score_button) return;
    send_score_button.setAttribute("style", "display: none;");

    // Remove event listeners by cloning the button
    // sorta hacky but it's good enough for now
    const clone = send_score_button.cloneNode(true);
    send_score_button.parentNode.replaceChild(clone, send_score_button);
}
