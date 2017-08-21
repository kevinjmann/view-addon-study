/**
 * Call the server with a json body, expect a json body in return.
 * Private function, not exposed via ViewServer class.
 *
 * @param {string} url The API endpoint to call
 * @param {Object} object The data which will be json-encoded.
 *
 * @return {Promise} Promise containing parsed JSON response
 */
const _postJson = function(url, object) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const obj = JSON.parse(xhr.responseText);
          resolve(obj);
        } catch (e) {
          reject(e);
        }
      } else {
        reject(Error(xhr.status + ": " + xhr.statusText));
      }
    };
    xhr.onerror = () => reject(Error("Network error. " + xhr.statusText));
    xhr.send(JSON.stringify(object));
  });
};

export default class ViewServer {
  constructor(url) {
    this.url = url;
  }

  /**
   * Retrieves a custom token from the server.
   *
   * @param {string} token The user token
   *
   * @return {Promise} Promise containing the custom token
   */
  async getCustomToken(token) {
    return _postJson(this.url + "/user", { "token": token });
  }
}
