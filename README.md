# Basic
Process oscillating node networking.

## Explanation
A node represents a computational unit that either preserves state or changes state.

An `inverter` node receives a state, changes that state to be either `0` or `1`, stores the state, then sends the state to it's neighbor.

A `preserver` node receives a state, stores it, then sends the state to it's upward neighbor if it received the state from a neighbor `below` or sends the state downward if it received it's state from a neighbor `above`.

A node is `above` another node if it has a larger `id` number.

A node is `below` another node if it has has a smaller `id` number.

## Features
- relational positioning
- state preservation
- fault tolerance