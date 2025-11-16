class APIResponse {
  constructor(success = true, message = "OK", data = null, statusCode = 200) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  send(res) {
    if (!res) {
      console.error("res is undefined in APIResponse.send()");
      return this; // just return the instance
    }
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

export default APIResponse;
