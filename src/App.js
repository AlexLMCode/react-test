import React, { useRef, useState, useEffect } from "react";
import "./styles.css"
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const addMoveable = async () => {

    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      },
    ]);
  };

  const deleteSelectedComponent = (e) => {
    if (e.code === "Backspace") {
      const elementIdToDelete = e.target.id.split("-")[1];
      setMoveableComponents(moveableComponents.filter(obj => obj.id != elementIdToDelete))
    }
  }

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };


  return (
    <main>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
            deleteSelectedComponent={deleteSelectedComponent}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  deleteSelectedComponent,
  isSelected = false,
}) => {
  const ref = useRef();
  const [imageUrl, setImageUrl] = useState("")
  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });


  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  useEffect(() => {
    getRandomImage().then(value => setImageUrl(value))
  }, [])

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - height;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - width;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const handleDrag = (e) => {
    const draggableRect = ref.current.getBoundingClientRect();
    if ((e.clientX >= parentBounds.left && (e.clientX + draggableRect.width <= parentBounds.right)) &&
      (e.clientY >= parentBounds.top && (e.clientY + draggableRect.height <= parentBounds.bottom))
    ) {
      //add draggableRect.width draggableRect.height accoints for
      ref.current.style.left = `${e.clientX}px`;
      ref.current.style.top = `${e.clientY}px`;

          updateMoveable(id, {
            top: e.clientY,
            left: e.clientX,
            width,
            height,
            color,
          });
    }
    else {
      //if mouse went out of bounds in Horizontal dir.
      if (e.clientX + draggableRect.width >= parentBounds.right) {
        ref.current.style.left = `${parentBounds.right - draggableRect.width}px`;
          updateMoveable(id, {
            top: e.top,
            left: parentBounds.right - draggableRect.width,
            width,
            height,
            color,
          });
      }
      //if mouse went out of bounds in Vertical dir.
      if (e.clientY + draggableRect.height >= parentBounds.bottom) {
        ref.current.style.top = `${parentBounds.bottom - draggableRect.height}px`;
          updateMoveable(id, {
            top: parentBounds.bottom - draggableRect.height,
            left: e.left,
            width,
            height,
            color,
          });
      }
    }
  }


  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${width}px ${height}px`,
          backgroundRepeat: "no-repeat"
        }}
        onClick={() => setSelected(id)}
        tabIndex={0}
        onKeyDown={deleteSelectedComponent}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          handleDrag(e)

        }}
        onResize={onResize}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};

const getRandomImage = async () => {
  const getImage = await fetch(`https://jsonplaceholder.typicode.com/photos/${Math.floor(Math.random() * 100)}`);
  const completeImage = await getImage.json();

  return completeImage.url
}
