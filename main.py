from flask import Flask, render_template, make_response, request, redirect
import datetime

APP_NAME = 'Group Mention for GroupMe'
APP_NAME_SHORT = 'Group Mention'

app = Flask(__name__, template_folder="templates")

# Key names
GM_KEY_ACCESS_TOKEN = "access_token"
APP_KEY_ACCESS_TOKEN = "access_token"

@app.context_processor
def inject_stage_and_region():
    """Inject variables using the context processor"""
    return dict(app_name = APP_NAME, app_name_short = APP_NAME_SHORT)

@app.route('/')
def index():
    """Route to index.html."""
    return render_template('index.html')

@app.route('/signin')
def signin():
    """Redirect to message with access_token"""
    token = request.args.get(GM_KEY_ACCESS_TOKEN)
    if (token != None):
        response = make_response(redirect('/message'))
        response.set_cookie(APP_KEY_ACCESS_TOKEN, request.args.get(GM_KEY_ACCESS_TOKEN), max_age = datetime.timedelta(minutes = 15))
        return response
    else:
        return render_template('404.html'), 404

@app.route('/message')
def message():
    """Route to message.html."""
    if APP_KEY_ACCESS_TOKEN in request.cookies:
        return render_template("message.html")
    else:
        return redirect("https://oauth.groupme.com/oauth/authorize?client_id=vMd7saYx555riexPmh4RmvyZrz6VMGwQQIwK1nLtr3ezBxod")

@app.route('/success')
def success():
    """Route to success.html."""
    return render_template('success.html')

@app.route('/faq')
def faq():
    """Route to faq.html."""
    return render_template('faq.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)