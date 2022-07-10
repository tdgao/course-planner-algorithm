# Using Flask as a micro framework
#  - following tutorial: https://www.freecodecamp.org/news/how-to-build-a-web-application-using-flask-and-deploy-it-to-the-cloud-3551c985e492/

from flask import Flask, render_template, Response, request
from flask import jsonify

from scraper.scraper import get_course_data


app = Flask(__name__)

@app.route("/")
def home():
    return render_template("course-planner.html")


# running get_course function onclick add-course-btn
# https://stackoverflow.com/questions/59975596/connect-javascript-to-python-script-with-flask
@app.route("/get_course")
def get_course():
    course_name = request.args.get('course_name')
    course_data = get_course_data(course_name)
    return jsonify(course_data)
    
if __name__ == "__main__":
    app.run(debug=True)