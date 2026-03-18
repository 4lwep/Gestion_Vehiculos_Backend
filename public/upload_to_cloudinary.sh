#!/bin/sh

# pipx install cloudinary-cli
# export CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

cld upload_dir products -o overwrite true -o use_filename true -o unique_filename false
