import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";

actor {
  type Project = {
    title : Text;
    projectType : Text;
    content : Text;
    owner : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module Project {
    public func compare(p1 : Project, p2 : Project) : Order.Order {
      Int.compare(p2.updatedAt, p1.updatedAt);
    };
  };

  let projects = Map.empty<Nat, Project>();
  var nextProjectId = 0;

  public shared ({ caller }) func createProject(title : Text, projectType : Text, content : Text) : async Nat {
    let timestamp = Time.now();
    let id = nextProjectId;
    let project : Project = {
      title;
      projectType;
      content;
      owner = caller;
      createdAt = timestamp;
      updatedAt = timestamp;
    };
    projects.add(id, project);
    nextProjectId += 1;
    id;
  };

  public query ({ caller }) func getProjects() : async [Project] {
    projects.values().toArray().filter(
      func(p) { p.owner == caller }
    ).sort();
  };

  public query ({ caller }) func getProject(id : Nat) : async Project {
    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        if (project.owner != caller) {
          Runtime.trap("Access denied");
        };
        project;
      };
    };
  };

  public shared ({ caller }) func updateProject(id : Nat, title : ?Text, content : ?Text) : async () {
    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        if (project.owner != caller) {
          Runtime.trap("Access denied");
        };
        let updatedProject : Project = {
          project with
          title = switch (title) {
            case (null) { project.title };
            case (?t) { t };
          };
          content = switch (content) {
            case (null) { project.content };
            case (?c) { c };
          };
          updatedAt = Time.now();
        };
        projects.add(id, updatedProject);
      };
    };
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async () {
    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        if (project.owner != caller) {
          Runtime.trap("Access denied");
        };
        projects.remove(id);
      };
    };
  };
};
