class Cube {
    constructor() {
        this.type = 'cube';
        this.color = color;
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.textureCoords = null;
    }

    render() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, ...rgba);
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        // Cubr front
        drawTriangle3DUVNormal(
            [0, 0, 0, 1, 1, 0, 1, 0, 0],
            [0, 0, 1, 1, 1, 0],
            [0, 0, -1, 0, 0, -1, 0, 0, -1]
        )
        drawTriangle3DUVNormal(
            [0, 0, 0, 0, 1, 0, 1, 1, 0],
            [0, 0, 0, 1, 1, 0],
            [0, 0, -1, 0, 0, -1, 0, 0, -1]
        )

        // gl.uniform4f(u_FragColor, ...rgba.map(v => v * 0.9));


        // Cube top
        drawTriangle3DUVNormal(
            [0, 1, 0, 0, 1, 1, 1, 1,1],
            [0, 0, 0, 1, 1, 1],
            [0,1,0,0,1,0,0,1,0]
        )
        drawTriangle3DUVNormal(
            [0, 1, 0, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 0],
            [0,1,0,0,1,0,0,1,0]
        )
        // gl.uniform4f(u_FragColor, ...rgba.map(v => v * 0.8));

        // Cube right
        drawTriangle3DUVNormal(
            [1,1,0, 1,1,1, 1,0,0],
            [0, 0, 0, 1, 1, 1],
            [1,0,0,1,0,0,1,0,0]
        )
        drawTriangle3DUVNormal(
            [1,0,0,1,1,1,1,0,1],
            [0, 0, 1, 1, 1, 0],
            [1,0,0,1,0,0,1,0,0]
        )
        // gl.uniform4f(u_FragColor, ...rgba.map(v => v * 0.7));
        // Cube left
        drawTriangle3DUVNormal(
            [0,1,0,0,1,1,0,0,0],
            [0,0,0,1,1,1],
            [-1,0,0,-1,0,0,-1,0,0]
        )
        drawTriangle3DUVNormal(
            [0,0,0,0,1,1,0,0,1],
            [0, 0, 1, 1, 1, 0],
            [-1,0,0,-1,0,0,-1,0,0]
        )
        // gl.uniform4f(u_FragColor, ...rgba.map(v => v * 0.6));
          // Cube bottom
          drawTriangle3DUVNormal(
            [0,0,0,0,0,1,1,0,1],
            [0,0,0,1,1,1],
            [0,-1,0,0,-1,0,0,-1,0]
        )
        drawTriangle3DUVNormal(
            [0,0,0,1,0,1,1,0,0],
            [0, 0, 1, 1, 1, 0],
            [0,-1,0,0,-1,0,0,-1,0]
        )
        // gl.uniform4f(u_FragColor, ...rgba.map(v => v * 0.5));
        // Cubr back
        drawTriangle3DUVNormal(
            [0,0,1,1,1,1,1,0,1],
            [0, 0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1]
        )
        drawTriangle3DUVNormal(
            [0,0,1,0,1,1,1,1,1],
            [0, 0, 0, 1, 1, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1]
        )

        // gl.uniform4f(u_FragColor, ...rgba.map(v => v * 0.6));



        // gl.uniform4f(u_FragColor, ...rgba.map(v => v * 0.4));



      
    }


    renderFast() {

        var rgba = this.color;
        gl.uniform4f(u_FragColor, ...rgba)

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements)

        let allVerts = []

        allVerts = allVerts.concat([0, 0, 0, 1, 1, 0, 1, 0, 0])
        allVerts = allVerts.concat([0, 0, 0, 0, 1, 0, 1, 1, 0])
        allVerts = allVerts.concat([0, 0, 1, 1, 1, 1, 1, 0, 1])
        allVerts = allVerts.concat([0, 0, 1, 0, 1, 1, 1, 1, 1])
        allVerts = allVerts.concat([1, 0, 0, 1, 1, 1, 1, 1, 0])
        allVerts = allVerts.concat([1, 0, 0, 1, 1, 1, 1, 0, 1])
        allVerts = allVerts.concat([0, 0, 0, 0, 1, 1, 0, 1, 0])
        allVerts = allVerts.concat([0, 0, 0, 0, 1, 1, 0, 0, 1])
        allVerts = allVerts.concat([0, 1, 0, 0, 1, 1, 1, 1, 1])
        allVerts = allVerts.concat([0, 1, 0, 1, 1, 1, 1, 1, 0])
        allVerts = allVerts.concat([0, 0, 0, 0, 0, 1, 1, 0, 1])
        allVerts = allVerts.concat([0, 0, 0, 1, 0, 1, 1, 0, 0])

        drawTriangle3D(allVerts)



    }
}
