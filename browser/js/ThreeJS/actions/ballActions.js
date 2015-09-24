(function() {
    let xGap = 0, zGap = 0, velocity, speed_exceeded = false;

    app.factory('BallActions', (WorldConstants) =>({
        ball: null,
        ball_light: null,
        scene: null,
        targets: [],
        camera: null,
        zeroVector: new THREE.Vector3(0, 0, 0),
        gravityVector: null,
        keys : { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 },
        keySpeed: WorldConstants.KEY_SPEED,
        impulse: new THREE.Vector3(0,WorldConstants.TARGET_IMPULSE,0),
        doDistanceFormula() {
            return Math.sqrt(Math.pow((this.ball.position.x - this.camera.position.x), 2) + Math.pow((this.ball.position.z - (this.camera.position.z - WorldConstants.CAMERA_OFFSET_Z)), 2));
        },
        computeGap(axis) {

            let gap = this.ball.position[axis] - this.camera.position[axis];

            if (Math.abs(gap) <= WorldConstants.CAMERA_FREEZE_GAP) {
                gap = 0;
            } else {
                gap = gap < 0 ? gap + WorldConstants.CAMERA_FREEZE_GAP : gap - WorldConstants.CAMERA_FREEZE_GAP;
            }

            return gap;
        },
        initActions() {
            let keyEventHandler = (event) => {
                let directionalsPressed = true;
                if (!event.repeat) {
                    switch ( event.keyCode ) {
                        case this.keys.UP:
                            this.gravityVector.z = event.type === 'keydown' ? -this.keySpeed : 0;
                            break;
                        case this.keys.BOTTOM:
                            this.gravityVector.z = event.type === 'keydown' ? this.keySpeed : 0;
                            break;
                        case this.keys.LEFT:
                            this.gravityVector.x = event.type === 'keydown' ? -this.keySpeed : 0;
                            break;
                        case this.keys.RIGHT:
                            this.gravityVector.x = event.type === 'keydown' ? this.keySpeed : 0;
                            break;
                        default:
                            directionalsPressed = false;
                    }

                    if (directionalsPressed) {
                        this.scene.setGravity(this.gravityVector);
                        console.log('linear velocity', this.ball.getLinearVelocity());
                    }
                }
            };

            this.targetCollideHandler = () => {
                if (velocity) {
                    this.impulse.x = velocity.x;
                    this.impulse.z = velocity.z;
                }
                this.ball.setAngularVelocity(this.zeroVector);
                this.ball.setLinearVelocity(this.impulse);
            };

            // threshhold setting for things moving too fast
            this.ball.setCcdMotionThreshold(1);
            this.ball.setCcdSweptSphereRadius(0.2);

            window.addEventListener( 'keydown', keyEventHandler, false );
            window.addEventListener( 'keyup', keyEventHandler, false );
        },
        update() {
            // Update ball lighting position
            this.ball_light.position.z = this.ball.position.z - WorldConstants.BALL_RADIUS * 3;
            this.ball_light.position.x = this.ball.position.x - WorldConstants.BALL_RADIUS;
            this.ball_light.position.y = this.ball.position.y + Math.pow(WorldConstants.BALL_RADIUS, 3);


            // Update Camera position
            xGap = this.computeGap('x');
            zGap = this.computeGap('z');

            if (xGap !== 0) {
                this.camera.position.x += xGap;
            }

            if (zGap !== 0) {
                this.camera.position.z += zGap;
            }

            this.camera.position.y = this.ball.position.y + WorldConstants.CAMERA_GAP;

            // if on target
            if (this.ball.position.y <= WorldConstants.BALL_RADIUS + 1) {
                if (Math.abs(this.ball.position.x) <= WorldConstants.TARGET_RADIUS + 1) {
                    if (_.inRange(Math.abs(this.ball.position.z), (WorldConstants.GROUND_WIDTH/2.45 + WorldConstants.TARGET_RADIUS + 1), (WorldConstants.GROUND_WIDTH/2.45 - WorldConstants.TARGET_RADIUS))) {
                        return this.targetCollideHandler();
                    }
                }

                if (Math.abs(this.ball.position.z) <= WorldConstants.TARGET_RADIUS + 1) {
                    if (_.inRange(Math.abs(this.ball.position.x), (WorldConstants.GROUND_WIDTH / 2.45 + WorldConstants.TARGET_RADIUS + 1), (WorldConstants.GROUND_WIDTH / 2.45 - WorldConstants.TARGET_RADIUS))) {
                        return this.targetCollideHandler();
                    }
                }
            }

            // checking speed limit
            velocity = this.ball.getLinearVelocity();
            if (Math.abs(velocity.x) > WorldConstants.BALL_SPEED_LIMIT) {
                velocity.x = Math.sign(velocity.x) * WorldConstants.BALL_SPEED_LIMIT;
                speed_exceeded = true;
            }

            if (Math.abs(velocity.z) > WorldConstants.BALL_SPEED_LIMIT) {
                velocity.z = Math.sign(velocity.z) * WorldConstants.BALL_SPEED_LIMIT;
                speed_exceeded = true;
            }

            if (speed_exceeded) {
                this.ball.setLinearVelocity(velocity);
                speed_exceeded = false;
            }
        }
    }));
})();