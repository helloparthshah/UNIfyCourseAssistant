#UNify Course Assistant
## Inspiration
What is the single biggest issue that we face as undergraduates living off-campus? Resoundingly, in our group, we answered, "finding classes coherently and meeting new people in classes". We feel that after the pandemic, we had lost touch with the campus and we had forgotten how campus life works. A student needs to have classes that are nearby, not only in timings but also on foot. Couple that with the urge to take classes with friends or with people we know. Sounds like a lot of work and a lot of stress, doesn't it? This is exactly what we solve.

## What does it do
UNIfy Course Assistant is a suite of tools that help you along the way in a college quarter. Starting with registering for classes, helps you plan out a schedule and visualize your journey on campus every day. Our tool automatically creates the map and the calendar for you which can be exported easily. Our tool connects with your discord account and our Discord bot helps you out with course groups, course reminders, and other general tools. We created a vanilla recommendation system that recommends other people based on the classes you have taken using a matching algorithm from other users' classes. Using this, you would be able to match with students who have or are currently taking classes similar to you. Once a course commences, we help you find a discord link where you can meet other people and make friends. We have used RateMyProfessor, a very common tool that people use, for the course and professor evaluations.

## How we built it

Our project is a combination of many individual components that are stitched on a REACT website. We created a discord bot that helps out with main tasks on the website and user's daily life on discord. Discord bot uses the Discord API and databases that we have created by scraping websites like RateMyProfessor. Additionally, we create multiple components like the calendar using react.js, maps using google maps API, and database on SQLite. We have created our own recommendation tool that uses a combination of the same classes and similar classes to what you've taken to help you meet people with common interests.

## Challenges we ran into
One of the toughest challenges was to get the Google Maps API to work and create a Discord bot since we had no experience doing that. Apart from that, there were no public APIs for RMP and getting courses thus we had to create our own web scraper to fetch the courses for our database.

## Accomplishments that we're proud of
We are proud of the final product we created and the problems it solves. 

## What we learned
We learned to create a full-stack application with multiple web services interacting with each other.

## What's next for UCDavis Course Helper

We plan on expanding the recommendation system to include other aspects of the UC Davis experience, like campus clubs, sports, interests, and even restaurants on and around campus. For the restaurant's implementation, we plan on using https://python.gotrained.com/yelp-fusion-api-tutorial/ which would help extract details of businesses based on a search term, and this brings with it a similar implementation on the frontend with ratings and locations, and an add-on in the commands of the Discord bot to view and add your favorite restaurants and see their ratings.
