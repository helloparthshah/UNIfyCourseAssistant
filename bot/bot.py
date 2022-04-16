import discord
import os
import random
import interactions
from discord_slash import SlashCommand, SlashContext
from discord.ext import tasks
from dotenv import load_dotenv
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

client.run(os.environ['TOKEN'])