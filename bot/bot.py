from aiohttp import request
import discord
import os
import random
import interactions
from discord_slash import SlashCommand, SlashContext
from discord.ext import tasks
from dotenv import load_dotenv
import requests
import json
load_dotenv()

intents = discord.Intents.default()
intents.members = True
client = discord.Client(intents=intents)
slash = SlashCommand(client, sync_commands=True)


@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))
    for guild in client.guilds:
        print(
            f'{client.user} is connected to the following guild:\n'
            f'{guild.name}\n'
        )
    global members
    members = guild.members


@slash.slash(name="faq", description="Answers a question")
async def _faq(ctx=SlashContext, *, link=None):
    url = link
    url = url.replace(' ', '-')
    url = "https://gatosecksual.kunpai.space/" + url
    await ctx.send(url)


@slash.slash(name="view_course", description="View information for a course")
async def _course(ctx=SlashContext, *, course=None, section=None):
    link = "http://127.0.0.1:5000/api/course"
    try:
        retjson = requests.post(
            url=link, json={"course": course})
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


client.run(os.environ['TOKEN'])
