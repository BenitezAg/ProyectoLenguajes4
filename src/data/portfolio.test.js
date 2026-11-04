import assert from "node:assert/strict";
import test from "node:test";
import { initialPortfolio, teamInfo, teamMembers } from "./portfolio.js";

test("lists the confirmed project team without invented personal details", () => {
  assert.equal(teamInfo.email, undefined);
  assert.deepEqual(
    teamMembers.map(({ name }) => name),
    [
      "Santiago Daniel Acuña",
      "Angel Gabriel Benitez",
      "Abel Villafañe",
      "Wilson Lopez",
    ],
  );

  for (const member of teamMembers) {
    assert.equal(member.role, "Integrante del equipo");
    assert.equal(member.email, undefined);
    assert.equal(member.github, undefined);
    assert.equal(member.linkedin, undefined);
    assert.equal(member.specialty, undefined);
    assert.deepEqual(member.skills, []);
  }

  for (const project of initialPortfolio.projects) {
    assert.equal(project.members, undefined);
  }

  assert.deepEqual(initialPortfolio.projects, []);
  assert.deepEqual(initialPortfolio.demos, []);
  assert.deepEqual(initialPortfolio.services, []);
});
