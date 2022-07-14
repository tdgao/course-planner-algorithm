from pkg_resources import require
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains

from bs4 import BeautifulSoup
import copy
import json
import re
import time


## TODO - try adding user agent to fix error from running scraper in headless mode
# http://allselenium.info/how-to-setup-user-agent-in-python-selenium-webdriver/

###############################
### uvic scraping functions ###

def get_page_source(url):
    #object of Options class, passing headless parameter
    c = Options()
    # c.add_argument('--headless')
    s = Service('scraper/drivers/chromedriver-v103.exe')
    browser = webdriver.Chrome(service=s, options=c)
    browser.set_window_size(1120, 550)

    browser.get(url)

    try:
        ## program waits until pre reqs container content is loaded
        element = WebDriverWait(browser, 5).until(
            EC.presence_of_element_located((By.ID, "kuali-catalog-main")) # class name of description h3 # id is container of loaded content
        )
        time.sleep(2) # wait 2s more to ensure all DOM loaded
    except: print("no rules wrapper after 10 seconds")

    ## using BeautifulSoup to parse html 
    soup = BeautifulSoup(browser.page_source, 'html.parser')
    browser.quit()
    
    return soup

def get_prereq_container(url=None, soup=None):
    if (url == None and soup == None): 
        print("Error: missing url or soup for argument")
        return
    if (soup == None): soup = get_page_source(url) # if pass in soup, will not run webdriver

    container = BeautifulSoup('')
    if (len(soup.select(".rules-wrapper")) > 0): #list is not empty
        container = soup.select(".rules-wrapper")[0]
    else:
        print('empty prereq container')
    return container

def top_ul(tag):
    return len(tag.find_parents("ul")) == 0 and tag.name == "ul"

"""
# ul denotes new requirement (complete 1 of, complete all of)
# ul's each li denotes requirement item
for ul
    look into each li
    if li has ul child
        remove ul and keep
    log li.text

    repeat for ul
"""
def get_requirements(ul):
    if (ul == None): return []
    requirements = []
    
    # all_top_ul = ul.find_all(top_ul)
    # print(len(ul.find_parents("ul")) == 0)

    for li in ul.find_all(["li", "div"], recursive=False):
        nested_ul = li.find("ul")
        if (nested_ul):
            li_title = copy.copy(li) # title (complete all of the following, complete all of, compete 1 of)
            li_title.find("ul").decompose()

            nested_req = {
                li_title.get_text(): get_requirements(nested_ul)
            }
            requirements.append(nested_req)
        else:
            if (li): ## if req has link, will return linked text (BIO123 instead of BIO123 - some description)
                if (li.find('a')):
                    requirements.append(li.find('a').get_text())
            else:
                requirements.append(li.get_text())

    return requirements



#####################################
### courses and program functions ###

def add_program(program_url):
    soup = get_page_source(program_url)
    container = get_prereq_container(soup=soup)

    program_h2 = soup.select_one("#__KUALI_TLP h2")
    if(program_h2 == None): 
        print("Error: uvic program has no program name from url %s"%program_url)
        return
    program_name = program_h2.get_text()

    program_requirements = {}
    all_year_ul = container.find_all(top_ul) # root ul of all years from program
    for i, year_ul in enumerate(all_year_ul, 1):
        requirements = get_requirements(year_ul)
        year = "year" + str(i)
        program_requirements[year] = requirements

    program_courses = get_program_courses(container)
    program = {
        program_name: {
            "requirements": program_requirements,
            # "courses": list( program_courses.keys() ) 
            # TODO - get list of courses by parsing requirements instead, so get 
            # program courses can be optimized to not scrape courses already 
            # existing in json (can even be done in js or python, both work) 
            # (should be done in js, so program is more single purposed i.e. to 
            # give requirements)
        }
    }

    # Writing to all_programs.json
    update_all_courses(program_courses)
    update_all_programs(program)

    # json_output_name = str(program_name) + ".json"
    # with open("scraper/output/"+json_output_name, "w") as outfile:
    #     outfile.write(json.dumps(program_requirements))

## returns all courses associated with program (ie courses in requirements)
## ommits courses that are no longer offered
def get_program_courses(courses_container):
    program_courses = {}

    ## get all course name and urls, then requirements
    for i, course in enumerate(courses_container.find_all('a')):
        course_name = course.get_text()
        course_url =  "https://www.uvic.ca/calendar/undergrad/index.php" + str(course['href'])
        # print(course_name, course_url)

        course_data = get_course_data(course_name, course_url)
        program_courses.update( course_data ) # add course data to program courses json
        # if (i > 3): break #for testing

    # print(json.dumps(program_courses, indent=2))
    return program_courses


def get_course_data(course_name, course_url=None):
    # TODO - first check if course exists in all_courses.js, with all_courses[course_name]
    # return that instance of data if it exists

    if (course_url == None): course_url = get_course_url(course_name)
    soup = get_page_source(course_url)
    container = get_prereq_container(soup=soup)

    # check if course is no longer offered (empty dict to not add course)
    status = soup.select_one("#course-status-notice")
    if (status != None):
        if (status.get_text() == "This course is no longer offered."):
            print("Not adding course (no longer offered)")
            return {}

    # print (course_url)
    requirements = get_requirements( container.find(top_ul) )
    full_title = get_course_title(soup)
    units = get_course_units(soup)
    return {course_name: {
        "course_name": course_name,
        "full_title": full_title,
        "requirements":requirements,
        "url": course_url,
        "units": units
    }}

def get_course_title(soup):
    full_title_h2 = soup.select_one("#__KUALI_TLP h2")
    if(full_title_h2 != None): 
        return full_title_h2.get_text()
    else:
        return None

def get_course_units(soup):
    units_h3 = soup.find("h3", string="Units")
    if (units_h3 == None):
        return None

    units = units_h3.next_sibling
    if(units == None): 
        return None
    
    return units.get_text()

## for add course function in scraper implementation
# TODO - currently runs browser driver 3 times, can cut to two by getting course url from one instance

def get_course_url(course_name):
    #object of Options class, passing headless parameter
    c = Options()
    # c.add_argument('--headless')
    s = Service('scraper/drivers/chromedriver-v103.exe')
    browser = webdriver.Chrome(service=s, options=c)
    browser.get("https://www.uvic.ca/calendar/undergrad/index.php#/courses") # uvic academic calendar - courses

    try:
        ## program waits until pre reqs container content is loaded
        element = WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.ID, "subjects-list-nav")) # id of subject list container
        )
    except: print("no presense of element after 10 seconds")
    course_subject = re.sub(r'[0-9]', '', course_name) # remove numbers from course name to get subject (MECH220 -> MECH)
    subject_url = browser.find_element(By.XPATH, "//a[contains(text(),'(%s)')]"%course_subject).get_attribute("href")

    browser.quit()

    #object of Options class, passing headless parameter

    print(subject_url)
    c = Options()
    # c.add_argument('--headless')
    s = Service('scraper/drivers/chromedriver-v103.exe')
    browser = webdriver.Chrome(service=s, options=c)
    browser.get(str(subject_url)) # uvic academic calendar - courses

    try:
        element = WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "style__item___N3dlN"))
        )
    except: print("no presense of element after 10 seconds")

    course_url = browser.find_element(By.XPATH, "//a[contains(text(),'%s')]"%course_name).get_attribute("href")

    browser.quit()
    print(course_url)
    return course_url


"""
when new program is added, 
 - push program to all programs json
 - and add/update it's courses to all courses json
when a new course is added
 - update course in all courses json

algorithm:
 - get json file -> dict
 - update dict with new values
 - write dict to json file
"""
def update_all_courses(new_courses):
    all_courses = None
    with open("static/uvic-calendar-data/all-courses.json", "r") as file:
        all_courses = json.load(file)
    print(all_courses)
    all_courses.update(new_courses)
    with open("static/uvic-calendar-data/all-courses.json", "w") as file:
        file.write(json.dumps(all_courses))

def update_all_programs(new_programs):
    all_programs = None
    with open("static/uvic-calendar-data/all-programs.json", "r") as file:
        all_programs = json.load(file)

    all_programs.update(new_programs)
    with open("static/uvic-calendar-data/all-programs.json", "w") as file:
        file.write(json.dumps(all_programs))



if __name__ == "__main__":
    ## UVIC PROGRAM INPUT HERE
    program_url = 'https://www.uvic.ca/calendar/undergrad/index.php#/programs/SJKVp7AME?bc=true&bcCurrent=Software%20Engineering&bcItemType=programs' #biology program
    add_program(program_url)
