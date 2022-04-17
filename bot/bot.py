from audioop import lin2adpcm
from locale import currency
from traceback import print_tb
from unicodedata import name
from aiohttp import request
import discord
import os
import random
import interactions
from discord_slash import SlashCommand, SlashContext
from discord.ext import tasks
from dotenv import load_dotenv
from itsdangerous import exc
import requests
import json
from datetime import datetime, timedelta
load_dotenv()

intents = discord.Intents.default()
intents.members = True
client = discord.Client(intents=intents)
slash = SlashCommand(client, sync_commands=True)
members = []


@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))
    for guild in client.guilds:
        print(
            f'{client.user} is connected to the following guild:\n'
            f'{guild.name}\n'
        )
    members = guild.members


@slash.slash(name="faq", description="Answers a question")
async def _faq(ctx=SlashContext, *, question=None):
    url = question
    url = url.replace(' ', '-')
    url = "https://gatosecksual.kunpai.space/" + url
    await ctx.send(url)


@slash.slash(name="think", description="Think")
async def _think(ctx=SlashContext):
    try:
        os.chdir("./think")
    except:
        None
    await ctx.send(file=discord.File(random.choice(os.listdir(os.getcwd()))))


# section not wokring properly

@slash.slash(name="course", description="View information for a course")
async def _course(ctx=SlashContext, *, course=None, section=""):
    link = "http://127.0.0.1:5000/api/course"
    try:
        retjson = requests.post(
            url=link, json={"course": course, "section": section})
        retjson = retjson.json()
        embed = discord.Embed(
            title=course.upper(), description="", color=0x00ff00)
        embed.set_author(name=ctx.author.name, icon_url=ctx.author.avatar_url)
        # for crns in sections get the class info
        embed.add_field(name=course, value=f"> Title: {retjson[0]['name']}\n> Instructor: {retjson[0]['instructor']}\n> \
                Units: {retjson[0]['units']}\n> Location: {retjson[0]['location']}\n> Time: {retjson[0]['time']}\n> Discussion: {retjson[0]['discussion']}\n> Discussion Location: {retjson[0]['discussion_location']}", inline=False)
        await ctx.send(embed=embed)
    except:
        notfound = discord.Embed(title="Course not found", color=0x00ff00)
        return await ctx.send(embed=notfound)


@slash.slash(name="professor", description="View information for a professor")
async def _prof(ctx=SlashContext, *, prof=None):
    try:
        link = "http://127.0.0.1:5000/api/professor"
        retjson = requests.post(url=link, json={"professor": prof})
        retjson = retjson.json()
        embed = discord.Embed(
            title="Professor", description="", color=0x00ff00)
        embed.set_author(name=ctx.author.name, icon_url=ctx.author.avatar_url)
        embed.add_field(name=prof, value=f"> Name: {retjson['name']}\n> Department: {retjson['department']}\n> \
                Difficulty: {retjson['difficulty']}\n> Rating: {retjson['rating']}\n> Would Take Again: {retjson['would_take_again']}\n> Number of Ratings: {retjson['num_ratings']}", inline=False)
        await ctx.send(embed=embed)

    except:
        notfound = discord.Embed(title="Professor not found", color=0x00ff00)
        return await ctx.send(embed=notfound)
    return None


@slash.slash(name="add_course", description="Add a course")
async def _add_course(ctx=SlashContext, *, course, section):
    try:
        link = "http://127.0.0.1:5000/api/add"
        retjson = requests.post(
            url=link, json={"course": course, "section": section, "user_id": ctx.author.id, "username": ctx.author.name})
        retjson = retjson.json()
        # check if 'error' exists in retjson
        if 'error' in retjson:
            courseadded = discord.Embed(
                title=retjson['error'], description="", color=0x00ff00)
            return await ctx.send(embed=courseadded)
        embed = discord.Embed(
            title=course.upper(), description="", color=0x00ff00)
        embed.set_author(name=ctx.author.name, icon_url=ctx.author.avatar_url)
        # for crns in sections get the class info
        embed.add_field(name=course, value=f"> Title: {retjson['name']}\n> Instructor: {retjson['professor']}\n> \
                Units: {retjson['units']}\n> Location: {retjson['location']}\n> Time: {retjson['time']}\n> Discussion: {retjson['discussion']}\n> Discussion Location: {retjson['discussion_location']}", inline=False)
        return await ctx.send(embed=embed)
    except Exception as e:
        print(e)
        notfound = discord.Embed(title="Course not found", color=0x00ff00)
        return await ctx.send(embed=notfound)


@slash.slash(name="view_courses", description="View your courses")
async def _add_course(ctx=SlashContext):
    try:
        link = "http://127.0.0.1:5000/api/view"
        retjson = requests.post(url=link, json={"user_id": ctx.author.id})
        retjson = retjson.json()
        embed = discord.Embed(
            title="Courses", description="", color=0x00ff00)
        embed.set_author(name=ctx.author.name, icon_url=ctx.author.avatar_url)
        for c in retjson:
            # for crns in sections get the class info
            embed.add_field(name=c['title'], value=f"> Title: {c['name']}\n> Instructor: {c['instructor']}\n> \
                    Units: {c['units']}\n> Location: {c['location']}\n> Time: {c['time']}\n> Discussion: {c['discussion']}\n> Discussion Location: {c['discussion_location']}", inline=False)
        await ctx.send(embed=embed)
    except Exception as e:
        print(e)
        notfound = discord.Embed(title="Error", color=0x00ff00)
        return await ctx.send(embed=notfound)


def getLectureTimes(time):
    # Convert 10:00 - 10:50 AM, MWF to datetime objects
    t = time.split(',')[0]
    start, end = t.split('-')
    start = start.strip()+' '+end.strip().split(' ')[1]
    end = end.strip()
    return [start, end, time.split(',')[1].strip()]


@tasks.loop(minutes=30)
async def reminder():
    link = "http://127.0.0.1:5000/api/view"
    for member in members:
        retjson = requests.post(url=link, json={"user_id": members.id})
        retjson = retjson.json()
        for c in retjson:
            tm = datetime.strptime(c['time'], "%I:%M %p %w")
            today = datetime.now()
            monday = today - timedelta(days=today.weekday())
            result = (monday + timedelta(days=int(c['time'][-1])))
            if result.isoweekday() != datetime.now().isoweekday():
                continue
            t = datetime.now().replace(hour=tm.hour, minute=tm.minute, second=0, microsecond=0)
            if abs(t-datetime.now()) <= timedelta(minutes=30):
                user = member
                embed = discord.Embed(title="Reminder", color=0x00ff00)
                embed.set_author(name=user.name, icon_url=user.avatar_url)
                embed.add_field(
                    name="You have a class right now", value=c['time'], inline=False)
            await user.send(embed=embed)

reminder.start()


client.run(os.environ['TOKEN'])
