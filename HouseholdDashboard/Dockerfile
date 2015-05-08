############################################################
# Dockerfile to set up a Web UI to Monitor Household Status Items
############################################################

# Set the base image to Ubuntu
FROM node

# File Author / Maintainer
MAINTAINER Shawn McNaughton

# Update the repository sources list
RUN apt-get update --quiet

############################################################
# Get the package from GitHub
############################################################
# Make the repo
# Set up the spare checkout and remote address
# Pull the files
# Copy the package out 
# Delete the repo
RUN mkdir repo \
    && cd repo \
    && git init \
    && git config core.sparsecheckout true \
    && echo HouseholdDashboard >> .git/info/sparse-checkout \
    && git remote add -f origin https://github.com/shawngmc/ServerSelfConfig.git \
    && git pull origin master 

############################################################
# Install and prep HouseholdDashboard
############################################################


# Expose default HTTP and telnet connector port.
EXPOSE 80

# Auto-start phant
ENTRYPOINT npm start