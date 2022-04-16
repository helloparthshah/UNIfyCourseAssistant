from aiohttp import request
import discord
import os
import random
import interactions
from discord_slash import SlashCommand, SlashContext
from discord.ext import tasks
from dotenv import load_dotenv
import requests
load_dotenv()

intents = discord.Intents.default()
intents.members = True
client = discord.Client(intents = intents)
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
async def _faq(ctx= SlashContext, *, link = None):
    url = link
    url = url.replace(' ', '-')
    url = "https://gatosecksual.kunpai.space/" + url
    await ctx.send(url)

@slash.slash(name="course", description="View information for a course")
async def _course(ctx = SlashContext, *, course = str, section: str = None):
    link = "http://127.0.0.1:5000/course/" + course
    retjson = requests.get(url=link)
    retjson = retjson.json()
    print(retjson)
    if len(retjson) == 0:
        notfound = discord.Embed(title="Course not found", color=0x00ff00)
        return await ctx.send(embed=notfound)
    embed = discord.Embed(
        title=course.upper(), description="", color=0x00ff00)
    embed.set_author(name=ctx.author.name, icon_url=ctx.author.avatar_url)
    # for crns in sections get the class info
    embed.add_field(name=course, value=f'> Title: {retjson['name']}\n> Instructor: {retjson['instructor']}\n> \
            Units: {retjson['units']}\n> Location: {retjson['location']}\n> Time: {retjson['time']}\n> Discussion: {retjson['discussion']}', inline=False)
    await ctx.send(embed=embed)
    


client.run(os.environ['TOKEN'])