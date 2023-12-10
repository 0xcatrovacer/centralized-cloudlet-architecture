#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

run_in_new_tab() {
    local command=$1
    osascript \
        -e "tell application \"Terminal\"" \
        -e "do script \"cd '$SCRIPT_DIR'; $command\"" \
        -e "end tell"
}

SIMULATION_ENV="DATA"

low_clients=4
mid_clients=2
high_clients=0

if [ "$SIMULATION_ENV" == "DATA" ]; then
    echo "Running in DATA mode"

    for ((i=0; i<low_clients; i++)); do
        run_in_new_tab "cd client; SIMULATION_ENV=DATA INITIAL_DISK_LOAD=200 DISK_LOAD_STATUS=LOW INITIAL_CPU_LOAD=5 CPU_LOAD_STATUS=LOW node index.js"
    done
    for ((i=0; i<mid_clients; i++)); do
        run_in_new_tab "cd client; SIMULATION_ENV=DATA INITIAL_DISK_LOAD=500 DISK_LOAD_STATUS=MID INITIAL_CPU_LOAD=5 CPU_LOAD_STATUS=LOW node index.js"
    done
    for ((i=0; i<high_clients; i++)); do
        run_in_new_tab "cd client; SIMULATION_ENV=DATA INITIAL_DISK_LOAD=800 DISK_LOAD_STATUS=HIG INITIAL_CPU_LOAD=5 CPU_LOAD_STATUS=LOW node index.js"
    done

    run_in_new_tab "cd end-device; SIMULATION_ENV=DATA node index.js"
    run_in_new_tab "cd server; node index.js"

elif [ "$SIMULATION_ENV" == "TASK" ]; then
    echo "Running in TASK mode"

    for ((i=0; i<low_clients; i++)); do
        run_in_new_tab "cd client; SIMULATION_ENV=TASK INITIAL_CPU_LOAD=20 CPU_LOAD_STATUS=LOW INITIAL_DISK_LOAD=100 DISK_LOAD_STATUS=LOW node index.js"
    done
    for ((i=0; i<mid_clients; i++)); do
        run_in_new_tab "cd client; SIMULATION_ENV=TASK INITIAL_CPU_LOAD=50 CPU_LOAD_STATUS=MID INITIAL_DISK_LOAD=100 DISK_LOAD_STATUS=LOW node index.js"
    done
    for ((i=0; i<high_clients; i++)); do
        run_in_new_tab "cd client; SIMULATION_ENV=TASK INITIAL_CPU_LOAD=80 CPU_LOAD_STATUS=HIG INITIAL_DISK_LOAD=100 DISK_LOAD_STATUS=LOW node index.js"
    done

    run_in_new_tab "cd end-device; SIMULATION_ENV=TASK node index.js"
    run_in_new_tab "cd server; node index.js"

else
    echo "SIMULATION_ENV is not correctly set. No action taken."
fi
