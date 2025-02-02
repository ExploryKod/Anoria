import * as THREE from 'three';
import { textures } from './data.js';
import GenerateMesh from "./GenerateMesh.js";

class AssetManager extends GenerateMesh {
    #geometry = new THREE.BoxGeometry(1, 1, 1);
    #assets = {};
    #modelPath = "";

    constructor() {
        super()
        this.#modelPath = `./resources/lowpoly/village_town_assets_v2.glb`
        this.initializeAssets();
    }

    #changeMeshColor(mesh, color) {
        mesh.traverse(obj => {
            if (obj.material) {
                obj.material = new THREE.MeshLambertMaterial({ color });
                obj.receiveShadow = true;
                obj.castShadow = true;
            }
        });
    }

    #createBuilding(x, y, z, size, meshName, objectsData, changeColor = false) {
        console.log("button objectsData", objectsData, meshName, size);
        const placerPos = new THREE.Vector3(x, y, z);
        const object3D = objectsData[meshName].clone();

        if (changeColor) {
            object3D.traverse(child => {
                if (child.isMesh) {
                    this.#changeMeshColor(child, 0xff00ff);
                }
            });
        }

        object3D.name = `${meshName}`;
        object3D.position.set(placerPos.x, placerPos.z, placerPos.y);
        object3D.scale.set(size, size, size);
        object3D.rotation.set(
            THREE.MathUtils.degToRad(90),
            THREE.MathUtils.degToRad(180),
            THREE.MathUtils.degToRad(180)
        );

        object3D.userData = {
            id: meshName,
            type: meshName,
            neighbors: [],
            pop: 0,
            stocks: { food: 0, cabbage: 0, wheat: 0, carrot: 0 },
            time: 0,
            isBuilding: true,
            roads: 0,
            stage: 0,
            stageName: "",
            price: 0,
            cityFunds: 0,
            maintenance: 0,
            worldTime: 0,
            x,
            y
        };

        return object3D;
    }

    #createZone(x, y, buildingId = '') {
        let mesh;
        let material;

        const materials = {
            'roads': new THREE.MeshLambertMaterial({
                map: textures['roads'],
                specularMap: textures['specular']
            }),
            'grass': new THREE.MeshLambertMaterial({
                map: textures['grass'],
                specularMap: textures['specular']
            })
        };

        switch (buildingId) {
            case 'roads':
                material = materials['roads'];
                mesh = new THREE.Mesh(this.#geometry, material);
                mesh.userData = { id: buildingId, x, y, isBuilding: false, time: 0 };
                mesh.name = buildingId;
                mesh.scale.set(1, 1, 1);
                mesh.position.set(x, -0.5, y);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                break;

            case 'grass':
                material = materials['grass'];
                mesh = new THREE.Mesh(this.#geometry, material);
                mesh.name = buildingId;
                mesh.userData = { id: buildingId, x, y, isBuilding: false, time: 0 };
                mesh.scale.set(1, 1, 1);
                mesh.position.set(x, -0.5, y);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                break;

            default:
                console.log(`default choice for ${buildingId}`);
        }

        return mesh;
    }

    async getButtonData() {
        return this.buttonData
    }

    getToolIds() {
        return this.toolIds
    }

    async #getModelsObj(type) {
        switch(type) {
            case 'building':
                return this.loadMeshes(this.#modelPath).buildingModelsObj;
            case 'tombstone':
                return this.loadMeshes(this.#modelPath).tombstonesModelsObj;
            case 'farm':
                return  this.loadMeshes(this.#modelPath).farmsModelsObj;
            case 'market':
                return this.loadMeshes(this.#modelPath).marketsModelsObj;
            default:
                throw new Error(`Unknown model type: ${type}`);
        }
    }

    initializeAssets() {
        const toolIds = this.toolIds
        const buttonData = this.loadMeshes(this.#modelPath).buttonData
        // Zones
        toolIds.zones.forEach(toolId => {
            this.#assets[toolId] = (x, y) => this.#createZone(x, y, toolId);
        });

        // Houses
        toolIds.houses.forEach(toolId => {
            this.#assets[toolId] = (x, y, z = 0) =>
                this.#createBuilding(x, y, z, 0.5, toolId, this.#getModelsObj('building'));
        });

        // Tombs
        toolIds.tombs.forEach(toolId => {
            this.#assets[toolId] = (x, y, z = 0) =>
                this.#createBuilding(x, y, z, 0.5, toolId, this.#getModelsObj('tombstone'));
        });

        // Farms
        toolIds.farms.forEach(toolId => {
            if (toolId.substring(0, 4) === "Farm") {
                this.#assets[toolId] = (x, y, z = 0) =>
                    this.#createBuilding(x, y, z, 1, toolId, this.#getModelsObj('farm'));
            } else {
                this.#assets[toolId] = (x, y, z = 0) =>
                    this.#createBuilding(x, y, z, 0.3, toolId, this.#getModelsObj('farm'));
            }
        });

        // Markets
        toolIds.markets.forEach(toolId => {
            this.#assets[toolId] = (x, y, z = 0) =>
                this.#createBuilding(x, y, z, 0.7, toolId, this.#getModelsObj('market'));
        });
    }

    // initializeAssets() {
    //     toolIds.zones.forEach(toolId => {
    //         this.#assets[toolId] = (x, y) => this.#createZone(x, y, toolId);
    //     });
    //
    //     toolIds.houses.forEach(toolId => {
    //         this.#assets[toolId] = (x, y, z = 0) =>
    //             this.#createBuilding(x, y, z, 0.5, toolId, this.buildingModelsObj);
    //     });
    //
    //     toolIds.tombs.forEach(toolId => {
    //         this.#assets[toolId] = (x, y, z = 0) =>
    //             this.#createBuilding(x, y, z, 0.5, toolId, tombstonesModelsObj);
    //     });
    //
    //     toolIds.farms.forEach(toolId => {
    //         if (toolId.substring(0, 4) === "Farm") {
    //             this.#assets[toolId] = (x, y, z = 0) =>
    //                 this.#createBuilding(x, y, z, 1, toolId, farmsModelsObj);
    //         } else {
    //             this.#assets[toolId] = (x, y, z = 0) =>
    //                 this.#createBuilding(x, y, z, 0.3, toolId, farmsModelsObj);
    //         }
    //     });
    //
    //     toolIds.markets.forEach(toolId => {
    //         this.#assets[toolId] = (x, y, z = 0) =>
    //             this.#createBuilding(x, y, z, 0.7, toolId, marketsModelsObj);
    //     });
    // }

    createAsset(assetId, x, y) {
        if (assetId in this.#assets) {
            return this.#assets[assetId](x, y);
        } else {
            console.warn(`Asset ${assetId} does not exist, see assets: `, this.#assets);
            return undefined;
        }
    }

    setSprite(texture = textures['no-roads'], name) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            depthTest: false,
            transparent: true,
            alphaTest: 0.5
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.name = name;
        return sprite;
    }

    setStatusSprite(mesh, texture, name, scale, position, visible = false) {
        const isAlreadySprite = mesh.children.find(
            child => child.type === "Sprite" && child.name === name
        );
        const sprite = isAlreadySprite ? isAlreadySprite : this.setSprite(texture, name);
        sprite.scale.set(scale.x, scale.y, scale.z);
        sprite.position.set(position.x, position.y, position.z);
        sprite.visible = visible;
        mesh.add(sprite);
    }
}

export default AssetManager;