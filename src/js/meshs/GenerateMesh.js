import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { wantedHouses } from "./data.js";

class GenerateMesh {

    toolIds = {
        zones: ['grass', 'roads'],
        houses: ['House-Blue', 'House-Red', 'House-Purple', 'House-2Story'],
        tombs: ['Tombstone-1', 'Tombstone-2', 'Tombstone-3'],
        farms: ['Farm-Wheat', 'Farm-Carrot', 'Farm-Cabbage', 'Windmill-001'],
        markets: ['Market-Stall'],
        nature: []
    };

    #allAssetsNames = [
        { houses: [] },
        { nature: [] },
        { farm: [] },
        { markets: [] },
        { other: [] }
    ];

    #assetFullName = null;
    #buildingModelsObj = {};
    #tombstonesModelsObj = {};
    #assetNames = [];
    #tombstonesNames = [];
    #farmsNames = [];
    #farmsModelsObj = {};
    #marketsModelsObj = {};
    buttonData = [];
    #gltfLoader = null;


    constructor() {
        this.#initializeLoaders();
    }

    #initializeLoaders() {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
        this.#gltfLoader = new GLTFLoader();
        this.#gltfLoader.setDRACOLoader(dracoLoader);
    }

    #processMeshName(child) {
        this.#assetFullName = child.name.replace(/[._\s]/g, '_');
        const parts = this.#assetFullName.split('_');
        return `${parts[0]}-${parts[1]}`;
    }

    #processAsset(toolName, child) {
        console.log("button asset", child.name)
        switch(true) {
            case this.toolIds.houses.includes(toolName):
                if (wantedHouses.includes(toolName)) {
                    this.buttonData.push({
                        text: "House-Red",
                        tool: toolName,
                        group: "House"
                    });
                    console.log("house button data", this.buttonData);
                }
                this.#assetNames.push(toolName);
                this.#buildingModelsObj[toolName] = child;
                break;

            // case this.toolIds.nature.includes(toolName):
            //     if (asset.nature) {
            //         asset.nature.push({
            //             fullName: child.userData.name,
            //             name: toolName,
            //             mesh: child
            //         });
            //     }
            //     break;

            // case this.toolIds.farms.includes(toolName):
            //     if (asset.farm) {
            //         asset.farm.push({
            //             fullName: child.userData.name,
            //             name: toolName,
            //             mesh: child
            //         });
            //         this.buttonData.push({
            //             text: asset.fullName?.split('_')[0] + ' ' + asset.fullName?.split('_')[1],
            //             tool: toolName,
            //             group: asset.fullName?.split('_')[0] || ''
            //         });
            //         this.#farmsNames.push(toolName);
            //         this.#farmsModelsObj[toolName] = child;
            //     }
            //     break;

            // case this.toolIds.markets.includes(toolName):
            //     if (asset.markets) {
            //         asset.markets.push({
            //             fullName: child.userData.name,
            //             name: toolName,
            //             mesh: child
            //         });
            //         this.buttonData.push({
            //             text: asset.fullName?.split('_')[0] + ' ' + asset.fullName?.split('_')[1],
            //             tool: toolName,
            //             group: asset.fullName?.split('_')[0] || ''
            //         });
            //         this.#marketsModelsObj[toolName] = child;
            //     }
            //     break;

            default:
                return false;
                // if (asset.fullName?.split('_')[0] === 'Tombstone') {
                //     this.buttonData.push({
                //         text: asset.fullName?.split('_')[0] + ' ' + asset.fullName?.split('_')[1],
                //         tool: toolName,
                //         group: asset.fullName?.split('_')[0] || ''
                //     });
                //     this.#tombstonesNames.push(toolName);
                //     this.#tombstonesModelsObj[toolName] = child;
                // }
                // if (asset.other) {
                //     asset.other.push({
                //         fullName: child.userData.name,
                //         name: toolName,
                //         mesh: child
                //     });
                // }
        }
    }

    async loadMeshes(modelPath) {
        try {
            const gltf = await this.#gltfLoader.loadAsync(modelPath);

            // Traverse scene and process meshes
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const toolName = this.#processMeshName(child);
                    console.log("button toolName", toolName)

                    this.#processAsset(toolName, child);
                }
            });
            console.log("[button data]", this.buttonData)
            return {
                buildingModelsObj: this.#buildingModelsObj,
                tombstonesModelsObj: this.#tombstonesModelsObj,
                farmsModelsObj: this.#farmsModelsObj,
                marketsModelsObj: this.#marketsModelsObj,
                assetNames: this.#assetNames,
                tombstonesNames: this.#tombstonesNames,
                farmsNames: this.#farmsNames,
                buttonData : this.buttonData
            };

        } catch (error) {
            console.error('Error loading meshes:', error);
            throw error;
        }
    }
}

export default GenerateMesh;