export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 ">
      <h1 className="text-2xl font-bold text-purple-600 cursor-pointer">Devs</h1>
      <div className="flex items-center space-x-4">
        <button className = "cursor-pointer">
      <animated-icons
          src="https://animatedicons.co/get-icon?name=notification&style=minimalistic&token=2a8c285f-a7a0-4f4d-b2c3-acccc136c454"
          trigger="hover"
          attributes='{"variationThumbColour":"#536DFE","variationName":"Two Tone","variationNumber":2,"numberOfGroups":2,"backgroundIsGroup":false,"strokeWidth":1,"defaultColours":{"group-1":"#000000","group-2":"#536DFE","background":"#FFFFFF"}}'
          height="30"
          width="30"
          
        ></animated-icons>
        </button>
        <animated-icons
          src="https://animatedicons.co/get-icon?name=Light%20Mode&style=minimalistic&token=5f4d2675-67d4-4c5e-9139-8226e36723ae"
          trigger="hover"
          attributes='{"variationThumbColour":"#000000","variationName":"Dark","variationNumber":4,"numberOfGroups":2,"strokeWidth":1.5,"backgroundIsGroup":true,"defaultColours":{"group-1":"#E6E9EC","group-2":"#000000","background":"#000000"}}'
          height="35"
          width="35"
        ></animated-icons>
        <button>
          <img className= "h-5 w-5 " src="/src/assets/barra-de-puntos.png" alt="Barra de puntos" />
        </button>
        <animated-icons
        src="https://animatedicons.co/get-icon?name=user%20profile&style=minimalistic&token=9b327b61-1433-451f-a476-148402217e82"
        trigger="hover"
        attributes='{"variationThumbColour":"#536DFE","variationName":"Two Tone","variationNumber":2,"numberOfGroups":2,"backgroundIsGroup":false,"strokeWidth":1,"defaultColours":{"group-1":"#000000","group-2":"#536DFE","background":"#FFFFFF"}}'
        height="35"
        width="35"
>     </animated-icons> 
      </div>
    </header>
  );
}