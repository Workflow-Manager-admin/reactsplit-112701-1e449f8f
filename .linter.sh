#!/bin/bash
cd /home/kavia/workspace/code-generation/reactsplit-112701-1e449f8f/reactsplit_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

