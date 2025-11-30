# Recommended Alias Block for .bashrc or .zshrc

To fully utilize the updated `/help` functionality and ensure all commands are properly recognized, please add the following alias block to your `~/.bashrc` or `~/.zshrc` file:

```bash
# BrewAssist DevOps Cockpit — slash aliases
alias /assist='bash ~/brewexec/overlays/brewassist.sh'
alias /agent='bash ~/brewexec/overlays/brewagent.sh'
alias /hrm='bash ~/brewexec/overlays/brewhrm.sh'
alias /llm='bash ~/brewexec/overlays/brewllm.sh'
alias /loop='bash ~/brewexec/overlays/brewloop.sh'
alias /loop_llm='bash ~/brewexec/overlays/brewloop_llm.sh'
alias /loop_mistral='bash ~/brewexec/overlays/brewloop_mistral.sh'
alias /router='bash ~/brewexec/overlays/brewrouter.sh'
alias /stack='bash ~/brewexec/overlays/brewstack.sh'   # when you add it
alias /sandbox='bash ~/brewexec/overlays/brewsandbox.sh' # New sandbox alias

alias /commit='bash ~/brewexec/overlays/brewcommit.sh'
alias /status='brewstatus'
alias /supa='bash ~/brewexec/overlays/brewsupa.sh'
alias /port='bash ~/brewexec/overlays/brewport.sh'
alias /test='bash ~/brewexec/overlays/brewtest.sh'     # engine test suite

alias /switch='brewjump'
alias /project='bash ~/brewproject.sh'
alias /setup='bash ~/brewsetup.sh'
alias /replay='bash ~/brewexec/overlays/brewreplay.sh'
alias /close='bash ~/brewclose.sh'
alias /autonomous='bash ~/brewexec/overlays/brewautonomous.sh'  # future

alias /help='bash ~/brewexec/overlays/brewhelp.sh'
alias /guide='bash ~/brewexec/overlays/brewguide.sh'
```

After adding these aliases, remember to `source ~/.bashrc` (or `~/.zshrc`) to apply the changes.

This completes the "DevOps Cockpit Help and Guide Revamp" task.

Now, we can proceed with testing the "AI Sandbox Module" as its dependencies are now met.
