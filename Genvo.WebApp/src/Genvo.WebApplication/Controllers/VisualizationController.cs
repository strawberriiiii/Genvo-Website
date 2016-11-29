using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Genvo.WebApplication.Controllers
{
    [Authorize]
    public class MyVisualizationController : Controller
    {

        //public IActionResult MyAccount()
        //{
        //    return View();
        //}

        [Route("visualization/MyAccount/{visualizationId}")]
        public string Visualization(string visualizationId)
        {
            return "This is the Welcome action method..." + visualizationId;
        }

    }

    
    public class PublicVisualizationController : Controller
    {
        [Route("visualization")]
        public IActionResult AnonymousVisualization()
        {
            return View();
        }

        [Route("visualization/{visualizationId}")]
        public IActionResult PublicVisualization(int vizId)
        {
            return View();
        }
    }
}
