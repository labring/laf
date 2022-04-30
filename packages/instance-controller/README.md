

# laf service controller


### Application instance status
```ts
export enum ApplicationInstanceStatus {
  CREATED = 'created',
  PREPARED_START = 'prepared_start',
  STARTING = 'starting',
  RUNNING = 'running',
  PREPARED_STOP = 'prepared_stop',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  PREPARED_RESTART = 'prepared_restart',
  RESTARTING = 'restarting'
}

```

### instance status machine

`created`: nop

`prepared_start`: 
  -> loop apps in `prepared_start`
      -> start app instance for each
      -> update app status to `starting`

`starting`:
  -> loop apps in `starting`
      -> get instance status for each app
      -> update running app status to `running`

`running`: nop

`prepared_stop`:
  -> loop apps in `prepared_stop`
      -> stop app instance for each
      -> update app status to `stopping`

`stopping`:
  -> loop apps in `stopping`
      -> get instance status for each app
      -> update stopped app status to `stopped`

`stopped`: nop

`prepared_restart`:
  -> loop apps in `prepared_restart`
      -> stop app instance for each
      -> update app status to `restarting`

`restarting`:
  -> loop apps in `restarting`
      -> get instance status for each app
      -> start stopped app & update app status to `starting`


### scheduler logic design

- set a timer to execute schedular loop
- call each handlers in loop: 
  - `prepared_start` handler
  - `starting` handler
  - `prepared_stop` handler
  - `stopping` handler
  - `prepared_restart` handler
  - `restarting` handler