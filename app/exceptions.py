class InvalidRequest(Exception):
    status_code = 400

class OTPExpired(Exception):
    status_code = 400

class OTPAttemptsExceeded(Exception):
    status_code = 429