app.factory('Planes', (WorldConstants) => ({
    init() {
        /* TODO Defining Materials --------------------------------------------------- */
        this.ground_material = this.ground_material || Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ color : WorldConstants.GROUND_COLOR}),
            0.8,
            0.4
        );
        this.ground_material_alt = this.ground_material_alt || Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ color : WorldConstants.GROUND_COLOR_ALT}),
            0.8,
            0.4
        );
    },
    _makePillars() {
        let pillar_geo = new THREE.BoxGeometry(WorldConstants.GROUND_WIDTH, WorldConstants.WALL_HEIGHT, WorldConstants.GROUND_LENGTH);

        let pillars = [];
        let pillar_material = this.ground_material;

        // Making pillars based on config
        _.forIn(WorldConstants.PILLARS, (arr, axis) => {
            pillar_material = pillar_material === this.ground_material_alt ? this.ground_material : this.ground_material_alt;

            // judging direction
            _.forEach(arr, (direction) => {

                pillars.push(((_direction, _axis) => {
                    let column = new Physijs.BoxMesh(
                        pillar_geo,
                        pillar_material,
                        0
                    );

                    column.position.y = WorldConstants.WALL_HEIGHT / 2;
                    column.position[_axis] = _axis === 'x' ? direction * WorldConstants.GROUND_WIDTH : direction * WorldConstants.GROUND_LENGTH;

                    return column;
                })(direction, axis));
            });
        });

        return pillars;
    },
    _makeBorders() {
        let invisible_wall = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ color : WorldConstants.GROUND_COLOR, transparent : true, opacity: 0.0 }),
            0.8,
            0.4
        );

        let horizontal_geo = new THREE.BoxGeometry(WorldConstants.GROUND_WIDTH, WorldConstants.WALL_HEIGHT * 2, 1);
        let vertical_geo = new THREE.BoxGeometry(1, WorldConstants.WALL_HEIGHT * 2, WorldConstants.GROUND_LENGTH);
        let column_geo = new THREE.BoxGeometry(WorldConstants.GROUND_WIDTH, WorldConstants.WALL_HEIGHT * 2, WorldConstants.GROUND_LENGTH);

        let walls = {
            x : [1, -1],
            z : [1, -1]
        }, columns = [
            [1, -1],
            [1, 1],
            [-1, 1],
            [-1, -1]
        ], invisibles = [];

        _.forIn(walls, (arr, axis) => {
            let geo = axis === 'x' ? vertical_geo : horizontal_geo;

            let mesh1 = new Physijs.BoxMesh(
                geo,
                invisible_wall,
                0
            ), mesh2 = new Physijs.BoxMesh(
                geo,
                invisible_wall,
                0
            );

            mesh1.position.y = mesh2.position.y = WorldConstants.WALL_HEIGHT;
            mesh1.position[axis] = arr[0] * (WorldConstants.GROUND_WIDTH * 1.5);
            mesh2.position[axis] = arr[1] * (WorldConstants.GROUND_WIDTH * 1.5);

            invisibles = invisibles.concat([mesh1, mesh2]);
        });

        _.forEach(columns, (dir) => {
            let mesh = new Physijs.BoxMesh(
                column_geo,
                invisible_wall,
                0
            );

            mesh.position.x = dir[0] * WorldConstants.GROUND_WIDTH;
            mesh.position.z = dir[1] * WorldConstants.GROUND_LENGTH;
            mesh.position.y = WorldConstants.WALL_HEIGHT;

            invisibles.push(mesh);
        });

        return invisibles;
    },
    makeBase() {
        let ground_geo = new THREE.BoxGeometry(WorldConstants.GROUND_WIDTH, 1, WorldConstants.GROUND_LENGTH);

        // Ground
        let ground = new Physijs.BoxMesh(
            ground_geo,
            this.ground_material,
            0
        );

        ground.receiveShadow = true;
        return ground;
    },
    gather() {
        this.init();

        let base = this.makeBase();

        // adding child planes
        _.forEach(Object.keys(this), (func) => {
            if (func[0] === '_') {
                let returnedObj = this[func]();

                if (Array.isArray(returnedObj)) {
                    _.forEach(returnedObj, (item) => base.add(item));
                } else {
                    base.add(returnedObj);
                }
            }
        });

        return base;
    }
}));
